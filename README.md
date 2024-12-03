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
pnpm install
pnpm run dev


## functionallity
Hover for a short time to add a word
Hover again to delete last word (which is marked)


# Ideas
-> word guessing
1) word guesser
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