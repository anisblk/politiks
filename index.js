require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

/*
* Serializes a query object to a query string
*/
const serialize = function serialize(obj) {
  return Object.keys(obj).reduce((array, key) => {
    array.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    return array;
  }, []).join('&');
};

/*
* Builds an url factory out of an Object
* {
*   protocol <String>,
*   subdomain <String>,
*   domain_name <String>,
*   port <String>,
*   auth <Object> {username : <String>, password : <String>},
* }
* The URL factory takes a params object
* {
*   path <String>,
*   query <Object>
* }
*/
const composeURL = function composeURL(data) {
  return (params) => {
    const subdomain = data.subdomain ? `${data.subdomain}.` : '';
    const protocol = data.protocol || 'http';
    const port = data.port ? `:${data.port}` : '';
    let queryString = serialize(params.query || {});
    const path = params.path || '';
    queryString = queryString && queryString.length ? `?${queryString}` : '';
    const authString = (data.auth && data.auth.username && data.auth.password) ? `${data.auth.username}:${data.auth.password}@` : '';
    return `${protocol}://${authString}${subdomain}${data.domain_name}${port}${path}${queryString}`;
  };
};

/*
* Creates a promise factory out of an URL data
* The promise factory takes a fetch params object
* {
*   method <String>,
*   headers <Object>,
*   body <Object>
* }
*/
class ComposeFetch {
  constructor(data) {
    this.url_maker = composeURL(data);
  }
  route(params) {
    const url = this.url_maker(params);
    const request = {
      method: params.method || 'get',
      headers: params.headers || {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: params.method && ['post', 'put'].includes(params.method.toLowerCase()) ?
      JSON.stringify(params.body || {}) :
      undefined,
    };
    const interceptors = Object.assign({
      request: req => req,
      response: (response) => {
        if (response.status >= 200 && response.status < 300) {
          return Object.assign(response.json(), { code: response.status });
        }
        return response.json().then((error) => {
          throw Object.assign(error, { code: response.status });
        });
      },
    }, (params.interceptors || {}));
    return Object.assign(fetch(url, interceptors
      .request(request))
      .then(interceptors.response), { url });
  }
}

module.exports = ComposeFetch;
