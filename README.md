# Wifistr

Open wifi map powered by nostr

## TODO

### General features

- [ ] Account export screen for transferring account to new phone
- [ ] Add location picker to wifi edit view to allow user to move network
- [ ] Show number of up/down votes on wifi networks
- [ ] Show last reaction time on wifi details / map
- [ ] Add support for local relay `ws://localhost:4869`
- [ ] Add view for managing trusted accounts (nostr contacts)
- [ ] Filter wifi networks on map based on trusted
- [ ] Filter wifi networks on map by date (updated / last reaction)
- [x] Add notification view for comments and reactions
- [ ] Update UI components to use DaisyUI instead of Tailwind classes

### Native app

- [ ] Setup CapacitorJS for native supports
- [ ] Add option to pick from nearby networks when adding network

### Cool features

- [ ] Ability to share all networks in area via bluetooth (.jsonl file)
- [ ] Use AI or OCR to scan wifi passwords

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

Learn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)
