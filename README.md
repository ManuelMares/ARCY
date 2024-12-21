# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```





## run project
install nvm -> node package manager
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
load nvm
	export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
install node
	nvm install node
install pnpm
	 curl -fsSL https://get.pnpm.io/install.sh | sh -
install vite
	pnpm add -D vite



## to deploy
* Deploy using dist folder instead of public 
  pnpm run build
  firebase deploy --only hosting

## functionallity
Hover for a short time to add a word
we use popular-english-words for list of words to autocomplete



# Ideas
2) autocompleter
3) sentence guesser divided by word
  Update sentence guesser, except when clicked on a button of this category
-> swipe keyboard
    canvas for swiping
    if swipe does not leave key, it is a touch
    AI -> shape matches word
-> guesser
    Given few words, guess the sentence
      Edit the guesses
        Use this as a root (similar guesses)
        Change tense
      Later, make it that the guesser has a start button, so instead of replacing whole text, it replaces only the guesser's buffer

-> edit
  When you enter to edit a word, you can also edit the key

-> keyboard
    center, smaller

-> guesser
    consider context
    2 steps?
    sentence structure?
      place -> I want to go to ___
      object -> I want ____
      verb -> I ___

-> new click
    deactivate guesser

-> Refresh
  has to exclude the options already provided before

-> Add a speech to text and suggest answers


-> Buscar conferencias para enviar (chi, etc.)
- HCC
Human Factors in Computing Systems
1.	Computer Human Interaction (CHI)	129	183
2.	Proceedings of the ACM on Human-Computer Interaction	81	126
3.	International Journal of Human-Computer Studies	67	109
4.	International Journal of Human-Computer Interaction	65	97
5.	IEEE Transactions on Affective Computing	64	103
6.	Behaviour & Information Technology	63	93
7.	Virtual Reality	59	104
8.	Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies	58	85
9.	International Journal of Interactive Mobile Technologies	56	73
10.	ACM/IEEE International Conference on Human Robot Interaction	54	76
11.	International Conference on Intelligent User Interfaces (IUI)	52	90
12.	ACM Symposium on User Interface Software and Technology	51	72
13.	ACM Designing Interactive Systems Conference	49	62
14.	IEEE Virtual Reality Conference	48	67
15.	ACM Transactions on Computer-Human Interaction (TOCHI)	47	69
16.	Universal Access in the Information Society	46	61
17.	IEEE Transactions on Human-Machine Systems	43	68
18.	HCI International	41	55
19.	International Journal of Child-Computer Interaction	38	59
20.	Frontiers in Virtual Reality	38	53

- Disabilities
Assistive Technology Industry Association (ATIA) Conference
CSUN Assistive Technology Conference
Applied Ergonomics Conference
LIFE Conference
International Conference on Applied Human Factors and Ergonomics (AHFE):
National Ergonomics Conference & ErgoExpo:
International Symposium on Human Factors and Ergonomics in Health Care
Applied Ergonomics Conference
CIEHF Ergonomics & Human Factors
Human Factors and Ergonomics Society Conference
IEEE Symposium on Visual Languages and Human-Centric Computing	VL/HCC	B1	Qualis
IEEE Symposium on Visual Languages and Human-Centric Computing (was VL)	VL/HCC	A	ERA
IEEE International Conference on Virtual Environments Human-Computer Interfaces and Measurement Systems	VECIMS	B4	Qualis
International Workshop on Horizontal Interactive Human-Computer Systems	Tabletop	B	ERA
Brazilian Symposium in Information and Human Language Technology	STIL	B4	Qualis
IEEE International Symposium on Robot and Human Interactive Communication	RO-MAN	B1	Qualis
Australasian Computer-Human Interaction Conference	OZCHI	B1	Qualis
Australian Computer Human Interaction Conference	OZCHI	B	ERA
Nordic Conference on Human-computer interaction	NordiCHI	B1	Qualis
Norwegian Computer Human Interaction	NORDCHI	C	ERA
International Conference on Human-Computer Interaction with Mobile Devices and Services	MobileHCI	B	ERA
International Conference on Human-Computer Interaction with Mobile Devices and Services	MobileHCI	A2	Qualis
Workshop on Language Technology for Cultural Heritage Social Sciences and Humanities	LaTeCH	B5	Qualis
Intelligent Human Computer Systems for Crisis Response and Management	ISCRAM	B4	Qualis
IFIP TC13 Conference on Human-Computer Interaction	Interact	A	ERA
Technology in Society	journal	2.249 Q1	88	229	835	18525	11016	834	12.66	80.90	34.93	GB
2	New Technology, Work and Employment	journal	2.009 Q1	60	34	62	2230	514	62	5.64	65.59	42.50	GB
3	Accident Analysis and Prevention	journal	1.897 Q1	188	304	1097	17558	7828	1095	6.74	57.76	32.22	GB
4	Telecommunications Policy	journal	1.647 Q1	86	108	290	7143	2280	281	7.00	66.14	30.20	GB
5	International Journal of Human Computer Studies	journal	1.435 Q1	145	124	291	9662	2386	290	7.74	77.92	35.25	US