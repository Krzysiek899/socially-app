import React from 'react';
import { Link } from 'react-router-dom';
import { Cluster } from '../../layout/index.tsx';
import './TopNav.css';

/* ── NavLink ──────────────────────────────────────────────────────────────── */

export interface NavLinkProps {
  href:      string;
  active?:   boolean;
  children:  React.ReactNode;
}

function NavLink({ href, active = false, children }: NavLinkProps): React.JSX.Element {
  return (
    <Link
      to={href}
      className={`top-nav__link${active ? ' top-nav__link--active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

/* ── Brand ────────────────────────────────────────────────────────────────── */

function Brand({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="top-nav__brand">{children}</div>;
}

/* ── Actions ──────────────────────────────────────────────────────────────── */

function Actions({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Cluster gap="2" align="center">
      {children}
    </Cluster>
  );
}

/* ── TopNav ───────────────────────────────────────────────────────────────── */

export interface TopNavProps {
  children: React.ReactNode;
}

function isNavLink(child: React.ReactNode): child is React.ReactElement<NavLinkProps> {
  return React.isValidElement(child) && child.type === NavLink;
}

function isBrand(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && child.type === Brand;
}

function isActions(child: React.ReactNode): child is React.ReactElement {
  return React.isValidElement(child) && child.type === Actions;
}

export function TopNav({ children }: TopNavProps): React.JSX.Element {
  const childArray = React.Children.toArray(children);

  const brandChild   = childArray.find(isBrand);
  const navLinks     = childArray.filter(isNavLink);
  const actionsChild = childArray.find(isActions);

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <Cluster gap="6" align="center">
          {brandChild}
          <Cluster as="nav" gap="1" align="center">
            {navLinks}
          </Cluster>
        </Cluster>
        {actionsChild}
      </div>
    </header>
  );
}

TopNav.Brand   = Brand;
TopNav.NavLink = NavLink;
TopNav.Actions = Actions;
