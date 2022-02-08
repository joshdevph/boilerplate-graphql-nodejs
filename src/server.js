require("dotenv").config();
import express from "express";
import { ApolloServer } from "apollo-server-express";
import db from "./db";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import http from "http";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';

// ! initialize sequelize with session store
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// ! Declare express application
const app = express();

// ! Middleware express
app.use(cookieParser());

// ! Setup Session
app.use(
    session({
        name: process.env.SESSION_NAME,
        secret: process.env.APP_SECRET,
        store: new SequelizeStore({
            db: db.sequelize,
        }),
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV == "production",
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: false,
        },
    })
);

// !Create HTTP Server
const httpServer = http.createServer(app);

// ! CORS 
app.use(
    cors({
        origin: ["http://localhost:4040"],
        credentials: true,
    })
);

// ! Create Schema
const schema = makeExecutableSchema({ typeDefs, resolvers });
const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
}, {
    server: httpServer,
    path: '/graphql',
});

// ! Apollo server creation
const server = new ApolloServer({
    schema,
    introspection: true,
    cors: true,
    context: async({ req, res, connection }) => {
        if (req) {
            return {
                db,
                res,
                session: req.session,
                me: req.session.user,
                secret: process.env.APP_SECRET,
            };
        }
    },
    plugins: [{
        async serverWillStart() {
            return {
                async drainServer() {
                    subscriptionServer.close();
                }
            };
        }
    }],
});

server.applyMiddleware({ app, path: "/graphql", cors: false });

// ! Sync Database
db.sequelize.sync().then(async() => {
    console.log(`Done Task ------> Database update to latest!`);
});


// ! Initiate Server
httpServer.listen({ port: process.env.PORT }, () => {
    console.log(
        `🚀 Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`,
    );
    console.log(
        `🚀 Subscriptions ready at ws://localhost:${process.env.PORT}${server.subscriptionsPath}`,
    );
});