interface HeaderScrimProps {
  className?: string;
}

// Shared progressive-blur material behind fixed/sticky top headers. No colour
// tint — only a blur that ramps from frosted at the top to nothing at the
// bottom edge. Each band carries a different blur radius and is masked to fade
// out at a different depth; stacking them yields a smooth top-to-bottom
// gradient with no visible step. The recipe lives in the `.app-header-scrim`
// rules in global.css so it stays in one place instead of being duplicated.
export function HeaderScrim({ className }: HeaderScrimProps) {
  return (
    <div
      aria-hidden
      className={['app-header-scrim', className].filter(Boolean).join(' ')}
    >
      <div className="app-header-scrim__blur" />
      <div className="app-header-scrim__blur" />
      <div className="app-header-scrim__blur" />
      <div className="app-header-scrim__blur" />
      <div className="app-header-scrim__blur" />
    </div>
  );
}
