const express = require('express');
const express_graphql = require('express-graphql');
const { buildSchema } = require('graphql');
// GraphQL schema
const schema = buildSchema(`
    type Query {
        user(id: Int): User
        allUsers(last: Int): [User!]
    }
    
    type Mutation {
        createUser(name: String!, bday: Int!): User!
    }
    
    type Subscription {
        newUser: User!
    }

    type User {
        id: Int!
        name: String!
        nickname: String!
    }
`);

// Root resolver
const users = [
    {
        id: 1,
        name: "user1",
        nickname: "a"
    },{
        id: 2,
        name: "user2",
        nickname: "b"
    },{
        id: 3,
        name: "user3",
        nickname: "c"
    }
];

const root = {
    user: (arg) => {
        return users.filter(user => {
            return user.id === arg.id;
        })[0];
    },
    allUsers: (arg) => {
        if (arg.last) {
            try {
                return users.slice(-1 * arg.last)
            } catch (e) {
                return users;
            }
        }

        return users;
    },
};

// Create an express server and a GraphQL endpoint
const app = express();
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));