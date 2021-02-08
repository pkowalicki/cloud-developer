### Image sharing app

Developed and tested with node `v13.14.0`.

Please go the `../client` directory and run `npm install` and then `npm run start`.

Each user needs to login: [http://localhost:3000](http://localhost:3000)
User can create, update and delete groups and upload images to a group.

Each group is either private or public. User can make her group private or public at any time by editing a group. Public groups are visible to all users. Private groups are visible only to owners.

Each group card on the home page contains the group title and shows the information about the group visibility and ownership:<br>
(Private) - private group of a user. No other user can see it.<br>
(Public) (Mine) - public group that user made public to others.<br>
(Public) (Others) - public group that other user made public.

User can edit, delete and upload images only to owned group (either private or public). Public groups of others are read-only so user can only browse group's images. Click group card to go to group details page and browse images.

User can register, deregister and update email for notifications about group made public by others. To receive notifications user needs to verify the email sent out by AWS. Only verified emails will receive notifications. Notification emails will be sent by udacitypkowalic@gmail.com via amazonses.com. These can end up in spam folder, so please search for it also there.

Whenever group is made public by any user web socket notification is sent out to all connected clients. Please use `wscat` to receive messages: `wss://2fnwlk8f9f.execute-api.eu-central-1.amazonaws.com/dev`.






