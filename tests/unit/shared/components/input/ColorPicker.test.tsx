import { renderWithMantine } from '@test/render';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from '@mantine/form';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker } from '@/shared/components/input/ColorPicker';

function ColorPickerHarness({
	onSubmit,
}: {
	onSubmit: (values: { color: string }) => void;
}) {
	const form = useForm({
		mode: 'controlled',
		initialValues: {
			color: '',
		},
	});

	return (
		<form onSubmit={form.onSubmit(onSubmit)}>
			<ColorPicker key={form.key('color')} {...form.getInputProps('color')} />
			<button type="submit">Save</button>
		</form>
	);
}

describe('ColorPicker', () => {
	it('submits the selected color through Mantine form props', async () => {
		const onSubmit = vi.fn();

		const { container } = renderWithMantine(
			<ColorPickerHarness onSubmit={onSubmit} />,
		);

		expect(container.querySelector('[data-path="color"]')).toBeTruthy();

		await userEvent.click(
			screen.getByRole('button', { name: 'Select #ef4444' }),
		);
		await userEvent.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				{ color: '#ef4444' },
				expect.anything(),
			);
		});
	});

	it('renders Mantine input wrapper label and validation error', () => {
		renderWithMantine(
			<ColorPicker
				label="Color"
				required
				error="Color should be a valid hex value like #A1B2C3."
			/>,
		);

		expect(screen.getByText('Color')).toBeInTheDocument();
		expect(
			screen.getByText('Color should be a valid hex value like #A1B2C3.'),
		).toBeInTheDocument();
		expect(screen.getByText('*')).toBeInTheDocument();
	});

	it('keeps a native hidden input in sync when name is provided', async () => {
		const { container } = renderWithMantine(
			<ColorPicker name="color" defaultColors={['#111111', '#222222']} />,
		);
		const input = container.querySelector('input[name="color"]');

		expect(input).toHaveValue('');

		await userEvent.click(
			screen.getByRole('button', { name: 'Select #222222' }),
		);

		expect(input).toHaveValue('#222222');
		expect(
			screen.getByRole('button', { name: 'Select #222222' }),
		).toHaveAttribute('aria-pressed', 'true');
	});

	it('does not change value while disabled', async () => {
		const onChange = vi.fn();
		const { container } = renderWithMantine(
			<ColorPicker
				name="color"
				value="#111111"
				onChange={onChange}
				disabled
				defaultColors={['#111111', '#222222']}
			/>,
		);
		const input = container.querySelector('input[name="color"]');

		await userEvent.click(
			screen.getByRole('button', { name: 'Select #222222' }),
		);

		expect(input).toHaveValue('#111111');
		expect(onChange).not.toHaveBeenCalled();
		expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
	});
});
