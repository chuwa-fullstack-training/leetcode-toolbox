// setup graphql client with axios
import axios from 'axios';

const graphqlClient = axios.create({
  baseURL: 'https://leetcode.com/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// add interceptor to add LEETCODE_SESSION in cookies to the request
// LEETCODE_SESSION is from user input
graphqlClient.interceptors.request.use((config) => {
  const leetcodeSession = config.data.session;
  config.headers['Cookie'] = `LEETCODE_SESSION=${leetcodeSession}`;
  delete config.data.session;
  return config;
});

export default graphqlClient;
