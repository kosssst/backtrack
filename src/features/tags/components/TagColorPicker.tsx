'use client';

import { TagColorPickerProps } from '@/features/tags/types';
import { ColorPicker, ColorSwatch, Group, Input, Menu } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import type { FocusEventHandler } from 'react';
import classes from '@/features/tags/components/Tag.module.css';

const DEFAULT_TAG_COLORS = [
	'#ef4444',
	'#f97316',
	'#f59e0b',
	'#84cc16',
	'#22c55e',
	'#14b8a6',
	'#0ea5e9',
	'#8b5cf6',
];

export function TagColorPicker(props: TagColorPickerProps) {
	const {
		defaultColors = DEFAULT_TAG_COLORS,
		value: valueProp,
		defaultValue,
		onChange,
		disabled,
		name,
		error,
		onBlur,
		onFocus,
		labelElement = 'div',
		...others
	} = props;

	const [value, setValue] = useUncontrolled<string>({
		value: valueProp,
		defaultValue,
		finalValue: '',
		onChange,
	});

	const selectedColor = value && defaultColors.includes(value) ? value : null;
	const isCustomSelected = value !== '' && value !== null && !selectedColor;
	const customSwatchColor = isCustomSelected ? value : '#ffffff';

	const handleFocus: FocusEventHandler<HTMLDivElement> = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			onFocus?.(event);
		}
	};

	const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			onBlur?.(event);
		}
	};

	const handleChange = (color: string) => {
		if (!disabled) {
			setValue(color);
		}
	};

	return (
		<Input.Wrapper
			{...others}
			error={error}
			labelElement={labelElement}
			onBlur={handleBlur}
			onFocus={handleFocus}
		>
			{name ? (
				<input
					type="hidden"
					name={name}
					value={value}
					disabled={disabled}
					readOnly
				/>
			) : null}
			<Group
				gap="xs"
				wrap="nowrap"
				role="group"
				aria-disabled={disabled || undefined}
			>
				{defaultColors.map((color, index) => (
					<ColorSwatch
						key={`${color}-${index}`}
						color={color}
						component="button"
						type="button"
						disabled={disabled}
						className={
							selectedColor === color ? classes.selectedSwatch : undefined
						}
						onClick={() => {
							handleChange(color);
						}}
						aria-label={`Select ${color}`}
						aria-pressed={selectedColor === color}
					/>
				))}
				<Menu shadow="md" width={100} withinPortal={false}>
					<Menu.Target>
						<ColorSwatch
							color={customSwatchColor}
							key="custom-color"
							component="button"
							type="button"
							disabled={disabled}
							className={isCustomSelected ? classes.selectedSwatch : undefined}
							aria-label="Select custom color"
							aria-pressed={isCustomSelected}
						/>
					</Menu.Target>
					<Menu.Dropdown>
						<ColorPicker
							format="hex"
							value={customSwatchColor}
							onChange={(color) => {
								handleChange(color);
							}}
						/>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</Input.Wrapper>
	);
}
