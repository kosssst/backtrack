import React, { PropsWithChildren, ReactElement } from 'react';
import { MantineProvider } from '@mantine/core';
import { render, RenderOptions } from '@testing-library/react';

function Wrapper({ children }: PropsWithChildren) {
  return <MantineProvider>{children}</MantineProvider>;
}

export function renderWithMantine(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: Wrapper, ...options });
}
