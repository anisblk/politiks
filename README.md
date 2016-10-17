# Politiks

A promise factory

## Create a server object
```js
const Api = require('./index');
/*
* {
*   protocol <String>,
*   subdomain <String>,
*   domain_name <String>,
*   port <String>,
*   auth <Object> {username : <String>, password : <String>},
* }
*/
const dummy = new Api({
  protocol: 'http',
  domain_name: 'localhost',
  port: 3000,
});
```

## Make URLs or API calls
```js
/*
* {
*   path <String>,
*   query <Object>,
*   method <String>,
*   headers <Object>,
*   body <Object>,
*   interceptors <Object> {
*     request : r => r,
*     response : r => r
*   }
* }
*/
const getUsers = query => dummy.route({
  path: '/users',
  query,
});

// http://localhost:3000/users?filter=trusted
getUsers({ filter: 'trusted' }).url;

// API promise
getUsers({ filter: 'trusted' })
.then((data) => {
  /*
  {
    data : [...]
  }
  */
})
.catch((error) => {
  /*
  {
    message : ..
  }
  */
});
```
## Development

    npm install

## Examples

* Launch dummy server `./server`
* Make a call `./call`
