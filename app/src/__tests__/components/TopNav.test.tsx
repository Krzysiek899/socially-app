import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopNav } from '../../shared/components/TopNav/TopNav.tsx';

describe('TopNav — Brand slot', () => {
  it('renders Brand children', () => {
    render(
      <TopNav>
        <TopNav.Brand><a href="/">Socially</a></TopNav.Brand>
      </TopNav>
    );
    expect(screen.getByRole('link', { name: /socially/i })).toBeInTheDocument();
  });
});

describe('TopNav — NavLink slot', () => {
  it('renders NavLink children as links', () => {
    render(
      <MemoryRouter>
        <TopNav>
          <TopNav.NavLink href="/home">Home</TopNav.NavLink>
          <TopNav.NavLink href="/explore">Explore</TopNav.NavLink>
        </TopNav>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '/explore');
  });

  it('sets aria-current="page" on the active NavLink', () => {
    render(
      <MemoryRouter>
        <TopNav>
          <TopNav.NavLink href="/home" active>Home</TopNav.NavLink>
          <TopNav.NavLink href="/explore">Explore</TopNav.NavLink>
        </TopNav>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /explore/i })).not.toHaveAttribute('aria-current');
  });

  it('applies top-nav__link--active class on the active NavLink', () => {
    render(
      <MemoryRouter>
        <TopNav>
          <TopNav.NavLink href="/home" active>Home</TopNav.NavLink>
          <TopNav.NavLink href="/explore">Explore</TopNav.NavLink>
        </TopNav>
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /home/i })).toHaveClass('top-nav__link--active');
    expect(screen.getByRole('link', { name: /explore/i })).not.toHaveClass('top-nav__link--active');
  });
});

describe('TopNav — Actions slot', () => {
  it('renders Actions children', () => {
    render(
      <TopNav>
        <TopNav.Actions>
          <button>Settings</button>
        </TopNav.Actions>
      </TopNav>
    );
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });
});

describe('TopNav — structure', () => {
  it('renders as a <header> element', () => {
    render(<TopNav><TopNav.Brand>Logo</TopNav.Brand></TopNav>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
