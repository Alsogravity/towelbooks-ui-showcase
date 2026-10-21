import type {
  ContributionContributor,
  ContributionContributorRole,
} from './contribution-resolution.js';

export const CONTRIBUTOR_MATCH_CONFIDENCE_VALUES = [
  'exact',
  'strong',
  'possible',
  'none',
] as const;

export type ContributorMatchConfidence =
  (typeof CONTRIBUTOR_MATCH_CONFIDENCE_VALUES)[number];

export const CONTRIBUTOR_MATCH_REASON_VALUES = [
  'same_external_identity',
  'normalized_name',
  'middle_name_omission',
  'punctuation_variation',
  'name_order',
  'initial_variation',
  'possible_alias',
  'conflicting_identity',
] as const;

export type ContributorMatchReason =
  (typeof CONTRIBUTOR_MATCH_REASON_VALUES)[number];

export type ContributorExternalIdentity = Readonly<{
  id: string;
  provider: string;
}>;

export type ContributorIdentityCandidateInput = Readonly<{
  externalIdentity?: ContributorExternalIdentity | null;
  isExisting?: boolean;
  name: string;
  role: ContributionContributorRole;
  source?: string | null;
}>;

export type ContributorIdentityCandidate = Readonly<{
  externalIdentity: ContributorExternalIdentity | null;
  isExisting: boolean;
  name: string;
  role: ContributionContributorRole;
  source: string | null;
}>;

export type ContributorMatch = Readonly<{
  confidence: ContributorMatchConfidence;
  reason: ContributorMatchReason;
}>;

export type ContributorIdentityCluster = Readonly<{
  canonical: ContributionContributor;
  id: string;
  members: readonly ContributorIdentityCandidate[];
}>;

export type ContributorMatchParticipant = Readonly<{
  canonical: ContributionContributor;
  clusterId: string;
  members: readonly ContributorIdentityCandidate[];
}>;

export type ContributorPossibleMatch = Readonly<{
  confidence: 'possible';
  id: string;
  left: ContributorMatchParticipant;
  reason: ContributorMatchReason;
  right: ContributorMatchParticipant;
}>;

export type ContributorIdentityResolution = Readonly<{
  clusters: readonly ContributorIdentityCluster[];
  contributors: readonly ContributionContributor[];
  possibleMatches: readonly ContributorPossibleMatch[];
}>;

export type ContributorMatchDecision = 'same_person' | 'keep_separate';

type ParsedContributorName = Readonly<{
  canonicalTokens: readonly string[];
  givenName: string;
  middleNames: readonly string[];
  nameOrderChanged: boolean;
  surname: string;
}>;

type IndexedCandidate = ContributorIdentityCandidate &
  Readonly<{ index: number }>;

type WorkingCluster = {
  canonical: ContributionContributor;
  id: string;
  members: IndexedCandidate[];
};

const AUTO_MATCH_CONFIDENCES = new Set<ContributorMatchConfidence>([
  'exact',
  'strong',
]);

/**
 * Classifies two credits without using fuzzy string similarity. Automatic
 * matches require the same role, the same surname and compatible given and
 * middle-name information.
 */
export function classifyContributorMatch(
  left: ContributorIdentityCandidateInput,
  right: ContributorIdentityCandidateInput,
): ContributorMatch {
  if (left.role !== right.role) {
    return { confidence: 'none', reason: 'conflicting_identity' };
  }

  const leftIdentity = normalizedExternalIdentity(left.externalIdentity);
  const rightIdentity = normalizedExternalIdentity(right.externalIdentity);

  if (leftIdentity && rightIdentity) {
    if (
      leftIdentity.provider === rightIdentity.provider &&
      leftIdentity.id === rightIdentity.id
    ) {
      return { confidence: 'exact', reason: 'same_external_identity' };
    }

    if (leftIdentity.provider === rightIdentity.provider) {
      return { confidence: 'none', reason: 'conflicting_identity' };
    }
  }

  const leftName = parseContributorName(left.name);
  const rightName = parseContributorName(right.name);

  if (tokensEqual(leftName.canonicalTokens, rightName.canonicalTokens)) {
    if (leftName.nameOrderChanged !== rightName.nameOrderChanged) {
      return { confidence: 'strong', reason: 'name_order' };
    }

    return {
      confidence: 'exact',
      reason:
        normalizeDisplayName(left.name).toLowerCase() ===
        normalizeDisplayName(right.name).toLowerCase()
          ? 'normalized_name'
          : 'punctuation_variation',
    };
  }

  if (
    leftName.canonicalTokens.length < 2 ||
    rightName.canonicalTokens.length < 2 ||
    leftName.surname !== rightName.surname
  ) {
    return { confidence: 'none', reason: 'conflicting_identity' };
  }

  const givenNameMatch = compareNamePart(
    leftName.givenName,
    rightName.givenName,
  );

  if (givenNameMatch === 'conflict') {
    return { confidence: 'none', reason: 'conflicting_identity' };
  }

  const middleNameMatch = compareMiddleNames(
    leftName.middleNames,
    rightName.middleNames,
  );

  if (middleNameMatch === 'conflict') {
    return { confidence: 'none', reason: 'conflicting_identity' };
  }

  if (givenNameMatch === 'possible' || middleNameMatch === 'possible') {
    return { confidence: 'possible', reason: 'initial_variation' };
  }

  if (middleNameMatch === 'omission') {
    return { confidence: 'strong', reason: 'middle_name_omission' };
  }

  return { confidence: 'possible', reason: 'possible_alias' };
}

/**
 * Resolves raw provider credits into automatically merged clusters and a
 * de-duplicated list of possible matches for user review.
 */
export function resolveContributorIdentities(
  candidates: readonly ContributorIdentityCandidateInput[],
): ContributorIdentityResolution {
  const indexedCandidates = candidates
    .map((candidate, index) => normalizeCandidate(candidate, index))
    .filter((candidate): candidate is IndexedCandidate => candidate !== null);
  const clusters: WorkingCluster[] = indexedCandidates.map((candidate) => ({
    canonical: { name: candidate.name, role: candidate.role },
    id: `cluster-${candidate.index}`,
    members: [candidate],
  }));

  const pairMatches = indexedCandidates
    .flatMap((left, leftIndex) =>
      indexedCandidates.slice(leftIndex + 1).map((right) => ({
        left,
        match: classifyContributorMatch(left, right),
        right,
      })),
    )
    .filter(({ match }) => AUTO_MATCH_CONFIDENCES.has(match.confidence))
    .sort((left, right) => {
      const confidenceOrder =
        confidenceRank(left.match.confidence) -
        confidenceRank(right.match.confidence);

      if (confidenceOrder !== 0) {
        return confidenceOrder;
      }

      return (
        left.left.index - right.left.index ||
        left.right.index - right.right.index
      );
    });

  for (const pair of pairMatches) {
    const leftCluster = findClusterForMember(clusters, pair.left.index);
    const rightCluster = findClusterForMember(clusters, pair.right.index);

    if (!leftCluster || !rightCluster || leftCluster.id === rightCluster.id) {
      continue;
    }

    if (!clustersAreMutuallyCompatible(leftCluster, rightCluster)) {
      continue;
    }

    mergeClusters(clusters, leftCluster, rightCluster);
  }

  const resolvedClusters = [...clusters]
    .sort((left, right) => clusterIndex(left) - clusterIndex(right))
    .map((cluster) => ({
      canonical: selectCanonicalContributor(cluster.members),
      id: cluster.id,
      members: cluster.members
        .slice()
        .sort((left, right) => left.index - right.index)
        .map(stripCandidateIndex),
    }));
  const possibleMatches = resolvePossibleMatches(resolvedClusters);

  return {
    clusters: resolvedClusters,
    contributors: resolvedClusters.map((cluster) => cluster.canonical),
    possibleMatches,
  };
}

/**
 * Applies only explicit user decisions to the clusters represented in the
 * review records. Unanswered or dismissed possible matches are separate.
 */
export function applyContributorMatchDecisions(
  contributors: readonly ContributionContributor[],
  matches: readonly ContributorPossibleMatch[],
  decisions: ReadonlyMap<string, ContributorMatchDecision>,
): ContributionContributor[] {
  if (matches.length === 0) {
    return [...contributors];
  }

  const clusterRecords = new Map<string, ContributorMatchParticipant>();
  for (const match of matches) {
    clusterRecords.set(match.left.clusterId, match.left);
    clusterRecords.set(match.right.clusterId, match.right);
  }

  const parent = new Map<string, string>(
    [...clusterRecords.keys()].map((clusterId) => [clusterId, clusterId]),
  );

  for (const match of matches) {
    if (decisions.get(match.id) !== 'same_person') {
      continue;
    }

    unionIds(parent, match.left.clusterId, match.right.clusterId);
  }

  const groups = new Map<
    string,
    {
      firstIndex: number;
      members: ContributorIdentityCandidate[];
      contributorKeys: Set<string>;
    }
  >();

  for (const [clusterId, record] of clusterRecords) {
    const root = findParent(parent, clusterId);
    const contributorKey = identityKey(record.canonical);
    const firstIndex = contributors.findIndex(
      (contributor) => identityKey(contributor) === contributorKey,
    );
    const group = groups.get(root) ?? {
      contributorKeys: new Set<string>(),
      firstIndex: firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex,
      members: [],
    };

    group.firstIndex = Math.min(
      group.firstIndex,
      firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex,
    );
    group.contributorKeys.add(contributorKey);
    group.members.push(
      ...record.members.map((member, index) => ({
        ...member,
        isExisting: member.isExisting,
        name: member.name,
        role: member.role,
        source: member.source,
        externalIdentity: member.externalIdentity,
        // Review records have no raw candidate index. The local index only
        // stabilizes canonical selection after a user-confirmed merge.
        index: group.members.length + index,
      })),
    );
    groups.set(root, group);
  }

  const replacements = [...groups.entries()]
    .sort((left, right) => left[1].firstIndex - right[1].firstIndex)
    .map(
      ([root, group]) =>
        [root, selectCanonicalContributor(group.members)] as const,
    );
  const replacementByContributorKey = new Map<string, string>();

  for (const [root, group] of groups) {
    for (const contributorKey of group.contributorKeys) {
      replacementByContributorKey.set(contributorKey, root);
    }
  }

  const replacementByRoot = new Map(replacements);
  const emittedRoots = new Set<string>();
  const resolved: ContributionContributor[] = [];

  for (const contributor of contributors) {
    const root = replacementByContributorKey.get(identityKey(contributor));

    if (!root) {
      resolved.push(contributor);
      continue;
    }

    if (!emittedRoots.has(root)) {
      resolved.push(replacementByRoot.get(root)!);
      emittedRoots.add(root);
    }
  }

  for (const [root, replacement] of replacements) {
    if (!emittedRoots.has(root)) {
      resolved.push(replacement);
    }
  }

  const seen = new Set<string>();
  return resolved.filter((contributor) => {
    const key = identityKey(contributor);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeCandidate(
  candidate: ContributorIdentityCandidateInput,
  index: number,
): IndexedCandidate | null {
  const name = normalizeDisplayName(candidate.name);

  if (!name) {
    return null;
  }

  return {
    externalIdentity: normalizedExternalIdentity(candidate.externalIdentity),
    index,
    isExisting: candidate.isExisting === true,
    name,
    role: candidate.role,
    source: normalizeSource(candidate.source),
  };
}

function parseContributorName(name: string): ParsedContributorName {
  const parts = name
    .normalize('NFKD')
    .split(',')
    .map((part) => tokenizeNamePart(part));
  const hasUsableNameOrder =
    parts.length === 2 && parts.every((part) => part.length > 0);
  const canonicalTokens = hasUsableNameOrder
    ? [...parts[1]!, ...parts[0]!]
    : tokenizeNamePart(name);

  return {
    canonicalTokens,
    givenName: canonicalTokens[0] ?? '',
    middleNames: canonicalTokens.slice(1, -1),
    nameOrderChanged: hasUsableNameOrder,
    surname: canonicalTokens.at(-1) ?? '',
  };
}

function tokenizeNamePart(value: string): string[] {
  return (
    value
      .normalize('NFKD')
      .toLowerCase()
      .replace(/\p{Diacritic}/gu, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/gu, ' ');
}

function tokensEqual(left: readonly string[], right: readonly string[]) {
  return (
    left.length === right.length &&
    left.every((token, index) => token === right[index])
  );
}

function compareNamePart(
  left: string,
  right: string,
): 'same' | 'possible' | 'conflict' {
  if (left === right) {
    return 'same';
  }

  if (isInitial(left) && right.startsWith(left)) {
    return 'possible';
  }

  if (isInitial(right) && left.startsWith(right)) {
    return 'possible';
  }

  return 'conflict';
}

function compareMiddleNames(
  left: readonly string[],
  right: readonly string[],
): 'same' | 'possible' | 'omission' | 'conflict' {
  if (tokensEqual(left, right)) {
    return 'same';
  }

  if (left.length === 0 || right.length === 0) {
    return 'omission';
  }

  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  let longerIndex = 0;
  let hasPossibleInitial = false;

  for (const token of shorter) {
    let found = false;

    while (longerIndex < longer.length) {
      const comparison = compareNamePart(token, longer[longerIndex]!);
      longerIndex += 1;

      if (comparison === 'conflict') {
        continue;
      }

      found = true;
      hasPossibleInitial ||= comparison === 'possible';
      break;
    }

    if (!found) {
      return 'conflict';
    }
  }

  return hasPossibleInitial ? 'possible' : 'omission';
}

function isInitial(value: string): boolean {
  return value.length === 1;
}

function normalizedExternalIdentity(
  identity: ContributorExternalIdentity | null | undefined,
): ContributorExternalIdentity | null {
  if (!identity?.provider.trim() || !identity.id.trim()) {
    return null;
  }

  return {
    id: identity.id.trim(),
    provider: identity.provider.trim().toLowerCase(),
  };
}

function normalizeSource(source: string | null | undefined): string | null {
  const normalized = source?.trim();
  return normalized ? normalized : null;
}

function confidenceRank(confidence: ContributorMatchConfidence): number {
  return confidence === 'exact' ? 0 : confidence === 'strong' ? 1 : 2;
}

function findClusterForMember(
  clusters: readonly WorkingCluster[],
  memberIndex: number,
): WorkingCluster | undefined {
  return clusters.find((cluster) =>
    cluster.members.some((member) => member.index === memberIndex),
  );
}

function clustersAreMutuallyCompatible(
  left: WorkingCluster,
  right: WorkingCluster,
): boolean {
  return left.members.every((leftMember) =>
    right.members.every((rightMember) =>
      AUTO_MATCH_CONFIDENCES.has(
        classifyContributorMatch(leftMember, rightMember).confidence,
      ),
    ),
  );
}

function mergeClusters(
  clusters: WorkingCluster[],
  left: WorkingCluster,
  right: WorkingCluster,
): void {
  const members = [...left.members, ...right.members].sort(
    (first, second) => first.index - second.index,
  );
  const merged: WorkingCluster = {
    canonical: selectCanonicalContributor(members),
    id: `cluster-${Math.min(...members.map((member) => member.index))}`,
    members,
  };
  const leftIndex = clusters.indexOf(left);
  const rightIndex = clusters.indexOf(right);

  clusters.splice(Math.max(leftIndex, rightIndex), 1);
  clusters.splice(Math.min(leftIndex, rightIndex), 1, merged);
}

function clusterIndex(
  cluster: WorkingCluster | ContributorIdentityCluster,
): number {
  const member = cluster.members[0];
  return member && 'index' in member ? member.index : Number.MAX_SAFE_INTEGER;
}

function resolvePossibleMatches(
  clusters: readonly ContributorIdentityCluster[],
): ContributorPossibleMatch[] {
  const matches: ContributorPossibleMatch[] = [];

  for (let leftIndex = 0; leftIndex < clusters.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < clusters.length;
      rightIndex += 1
    ) {
      const left = clusters[leftIndex]!;
      const right = clusters[rightIndex]!;
      const pairResults = left.members.flatMap((leftMember) =>
        right.members.map((rightMember) =>
          classifyContributorMatch(leftMember, rightMember),
        ),
      );

      if (
        pairResults.some(({ confidence }) => confidence === 'none') ||
        !pairResults.some(({ confidence }) => confidence === 'possible')
      ) {
        continue;
      }

      const reason = pairResults
        .filter(({ confidence }) => confidence === 'possible')
        .sort(
          (first, second) =>
            reasonRank(first.reason) - reasonRank(second.reason),
        )[0]!.reason;

      matches.push({
        confidence: 'possible',
        id: `match-${left.id}-${right.id}`,
        left: toParticipant(left),
        reason,
        right: toParticipant(right),
      });
    }
  }

  return matches;
}

function reasonRank(reason: ContributorMatchReason): number {
  return reason === 'initial_variation'
    ? 0
    : reason === 'possible_alias'
      ? 1
      : 2;
}

function toParticipant(
  cluster: ContributorIdentityCluster,
): ContributorMatchParticipant {
  return {
    canonical: cluster.canonical,
    clusterId: cluster.id,
    members: cluster.members,
  };
}

function selectCanonicalContributor(
  members: readonly (ContributorIdentityCandidate | IndexedCandidate)[],
): ContributionContributor {
  const selected = members
    .map((member, index) => ({ member, index }))
    .sort((left, right) => {
      const existingOrder =
        Number(right.member.isExisting) - Number(left.member.isExisting);
      if (existingOrder !== 0) return existingOrder;

      const identityOrder =
        Number(right.member.externalIdentity !== null) -
        Number(left.member.externalIdentity !== null);
      if (identityOrder !== 0) return identityOrder;

      const informationOrder =
        contributorInformationScore(right.member.name) -
        contributorInformationScore(left.member.name);
      if (informationOrder !== 0) return informationOrder;

      const formattingOrder =
        contributorFormattingScore(right.member.name) -
        contributorFormattingScore(left.member.name);
      if (formattingOrder !== 0) return formattingOrder;

      const orderPreference =
        Number(!parseContributorName(left.member.name).nameOrderChanged) -
        Number(!parseContributorName(right.member.name).nameOrderChanged);
      if (orderPreference !== 0) return orderPreference;

      const sourceOrder = compareStable(
        left.member.source ?? '',
        right.member.source ?? '',
      );
      if (sourceOrder !== 0) return sourceOrder;

      const identityOrderStable = compareStable(
        externalIdentityKey(left.member.externalIdentity),
        externalIdentityKey(right.member.externalIdentity),
      );
      if (identityOrderStable !== 0) return identityOrderStable;

      const nameOrder = compareStable(
        normalizeDisplayName(left.member.name).toLowerCase(),
        normalizeDisplayName(right.member.name).toLowerCase(),
      );
      return nameOrder || left.index - right.index;
    })[0]?.member;

  return {
    name: selected?.name ?? '',
    role: selected?.role ?? 'contributor',
  };
}

function contributorInformationScore(name: string): number {
  const parsed = parseContributorName(name);
  const fullNameTokenCount = parsed.canonicalTokens.filter(
    (token) => token.length > 1,
  ).length;

  return fullNameTokenCount * 10 + parsed.middleNames.length * 3;
}

function contributorFormattingScore(name: string): number {
  return (normalizeDisplayName(name).match(/\./gu) ?? []).length;
}

function externalIdentityKey(
  identity: ContributorExternalIdentity | null,
): string {
  return identity ? `${identity.provider}:${identity.id}` : '';
}

function compareStable(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stripCandidateIndex(
  candidate: IndexedCandidate,
): ContributorIdentityCandidate {
  const { index: _index, ...withoutIndex } = candidate;
  return withoutIndex;
}

function identityKey(contributor: ContributionContributor): string {
  return `${parseContributorName(contributor.name).canonicalTokens.join(' ')}:${contributor.role}`;
}

function findParent(parent: Map<string, string>, id: string): string {
  const current = parent.get(id) ?? id;
  if (current === id) return current;

  const root = findParent(parent, current);
  parent.set(id, root);
  return root;
}

function unionIds(
  parent: Map<string, string>,
  left: string,
  right: string,
): void {
  const leftRoot = findParent(parent, left);
  const rightRoot = findParent(parent, right);

  if (leftRoot === rightRoot) return;

  const [first, second] = [leftRoot, rightRoot].sort(compareStable);
  parent.set(second!, first!);
}
