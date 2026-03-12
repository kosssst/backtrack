import { renderWithMantine } from '@test/render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserCardSmall } from '@/components/containers/UserCardSmall';

describe('UserCardSmall', () => {
  it('renders the user name and email', () => {
    renderWithMantine(
      <UserCardSmall user={{ name: 'John Doe', email: 'john@example.com' }} />,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
