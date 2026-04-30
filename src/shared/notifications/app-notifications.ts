import { notifications } from '@mantine/notifications';

/**
 * Shows a success notification with the app's standard title and color.
 */
export function showSuccess(message: string, title = 'Success') {
	notifications.show({
		color: 'green',
		title,
		message,
	});
}

/**
 * Shows a failure notification with the app's standard title and color.
 */
export function showFailure(message: string, title = 'Failure') {
	notifications.show({
		color: 'red',
		title,
		message,
	});
}

/**
 * Shows an error notification for unexpected load/runtime failures.
 */
export function showError(message: string, title = 'Error') {
	notifications.show({
		color: 'red',
		title,
		message,
	});
}
