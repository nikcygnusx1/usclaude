import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui';

describe('Badge', () => {
  it('renders its children and an accessible status label', () => {
    render(<Badge status="blocked">Blocked</Badge>);
    expect(screen.getByText('Blocked')).toBeInTheDocument();
    expect(screen.getByLabelText('Status: blocked')).toBeInTheDocument();
  });
});
