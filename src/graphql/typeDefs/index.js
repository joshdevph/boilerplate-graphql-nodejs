import { gql } from 'apollo-server-express';

import userSchema from './User';
import productimageSchema from './ProductImage';
import productSchema from './Product';
import categorySchema  from './Category';

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

export default [
  linkedSchema, 
  userSchema, 
  productimageSchema, 
  productSchema,
  categorySchema
];