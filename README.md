# Usage

Set the environment variables
- export CONFLUENCEURL=https://<username>:<password@host
- export PROXYURL=http://<username>:<password@host

Then run

```
node publish.js $1 $2 $3 $4
```
where
- $1  is the confluence space
- $2 is the confluence parent page Name
- $3 is the page name
- $4 is the filename

The file will upload confluence as an attachment.
The attachment is made to a page with the name 'page name'.
The page is created if it doesnt exist as a child of the parent page name.
The pages must exist in the confluence space.
