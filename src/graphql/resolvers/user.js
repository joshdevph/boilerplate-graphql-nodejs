import { UserInputError } from 'apollo-server';
import { Op } from 'sequelize';
import { isAuthenticated, isSessionAuthenticated } from './authorization';
import { combineResolvers } from 'graphql-resolvers';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const NEW_USER_ADDED = "NEW_USER_ADDED";
export default {
    Subscription: {
        newRegistration: {
            subscribe: (parent, args, { session }) => pubsub.asyncIterator([NEW_USER_ADDED]),
        },
    },
    Query: {
        // ! This query is for the logged in user
        isLoggedIn: async(root, args, { session }, info) => {
            return isSessionAuthenticated(session);
        },
        me: combineResolvers(
            isAuthenticated,
            async(root, args, { db, me }, info) => {
                const user = await db.user.findByPk(me.id);
                return user;
            }
        ),
        // ! This query grabs all the users
        users: combineResolvers(
            isAuthenticated,
            async(root, args, { db }, info) => {
                const users = await db.user.findAll();
                if (!users) {
                    throw new Error('No users found');
                }
                return users;
            }
        ),
        alladminuser: async(root, args, { db, session }, info) => {
            if (session.user) {
                if (session.user.id) {
                    console.log(session);
                    const users = await db.user.findAll({
                        where: {
                            userid: session.user.id
                        }
                    });
                    if (!users) {
                        throw new Error('No users found');
                    }
                    return users;
                }
            } else {
                throw new Error('No session found');
            }
        }
    },
    Mutation: {
        // ! This mutation creates new user
        createUser: async(root, { input }, { db, session }) => {
            const { username, email } = input;
            const userExists = await db.user.findOne({
                where: {
                    [Op.or]: [{ email }, { username }],
                },
            });
            if (userExists) {
                throw new Error('A user with this email or username already exists');
            }
            if (session.user) {
                if (session.user.role == "admin") {
                    input.role = 'adminuser'
                    input.userid = session.user.id
                }
            }
            const user = await db.user.create({
                ...input,
            });
            pubsub.publish(NEW_USER_ADDED, {
                newRegistration: user
            })
            return user;
        },
        login: async(root, { username, password }, { db, session }, info) => {
            const user = await db.user.findOne({
                where: { username },
            });
            if (!user) {
                throw new UserInputError(`User with ${username} does not exist`);
            }

            const isValid = await user.validatePassword(password);
            if (!isValid) {
                throw new UserInputError('Password is invalid');
            }

            session.user = {
                id: user.dataValues.id,
                username: user.dataValues.username,
                email: user.dataValues.email,
                role: user.dataValues.role
            };

            return user;
        },
        logout: async(root, args, { session, res }, info) => {
            let loggedOutUser = session.user;
            await session.destroy();
            res.clearCookie(process.env.SESSION_NAME);
            return loggedOutUser;
        },
    }
};