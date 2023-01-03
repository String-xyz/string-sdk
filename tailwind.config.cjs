module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	daisyui: {
		themes: [
			{
				stringTheme: {
					primary: '#006AB7',
					secondary: '#F92572',
					neutral: '#003669',

				}
			}
		]
	},
	plugins: [require('daisyui')]
};
