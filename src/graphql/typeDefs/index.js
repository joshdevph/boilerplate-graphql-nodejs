import { gql } from 'apollo-server-express';

import userSchema from './User';

const linkedSchema = gql `
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export default [linkedSchema, userSchema];