import { render, fireEvent, screen } from '@testing-library/svelte';
import { StringPay } from '$lib/StringPay'
import { StringPayButton } from '$lib';
import { testPayload } from './mock'

describe('StringPayButton.svelte', () => {
	it('shows proper text when rendered', () => {
		render(StringPayButton, {payload: testPayload})
		const button = screen.getByRole('button')
		expect(button).toHaveTextContent('Mint with Card')

	});

	it('loads iframe when clicked', async () => {
		const container = document.createElement('div');
		container.classList.add('string-pay-frame');
		document.body.appendChild(container);

		(<any>window).StringPay = new StringPay()

		render(StringPayButton, {payload: testPayload})
		const button = screen.getByRole('button')

		await fireEvent.click(button)
		const frame = document.getElementsByTagName("iframe")[0]

		expect(frame).toBeTruthy()
		expect(container).toContainElement(frame)
	});
});
