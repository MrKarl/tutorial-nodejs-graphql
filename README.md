# GraphQL


## What Is It?
GraphQL : The New API Standard. A Query Language for APIs(not databases).
developed and opensourced by fb
(an API defines how a client can load data from a server.)


API 진화
```
RPC -> SOAP -> REST -> GraphQL
```

REST 는 단순 명세이기 때문에 RESTful과 REST-Like가 나뉨.
정답이 없는 상태.

GraphQL 은 single end point이기 때문에, 관리가 쉽다 (versioning 및 클라이언트에서 할 업무를 줄여준다.)



1. 모바일 사용 증가로 인해, 효율적인 데이터 로딩이 필요
    - 데이터 양을 감소시켜 줌
2. 프론트엔드 프레임워크/플랫폼이 매우 다양해짐
    - 프레임워크별로 Rest API 를 개발 및 유지보수 하는 것이 힘듦
3. 빠른 개발이 필요
    - CD(Continuous deployment)은 이제 대세(스텐다드)가 되었음. 빠른 iteration과 잦은 배포는 필수적임. REST API의 변경은 Server 뿐만 아니라, Client 코드도 변경되어야함.




## 본격 비교 | REST vs GraphQL
만약, 어떤 SNS 서비스에서 User Profile, User가 등록한 Posts, User의 Follower 목록을 보고 싶다고 하자.

### REST
위의 "요구사항"이 3가지(Profile, Post, Follower)이므로, 3번의 request가 필요하다.

```uml
== Request 1 for get Profile ==
Client->Server: request to <font color=red><b>/users/{id}</b></font> with <b>HTTP <font color=blue>GET</font></b>
    note right of Client 
      id: "restUserId"
    end note

Server->Client: response with
    note left of Server 
    {
      user: {
        id: "restUserId",
        name: "Panki Park",
        nickname: "xx"
      }
    }
    end note

== Request 2 for get Post ==
Client->Server: request to <font color=red><b>/users/{id}/posts</b></font> with <b>HTTP <font color=blue>GET</font></b>
    note right of Client 
        id: "restUserId"
    end note

Server->Client: response with
    note left of Server 
    {
      posts: [ {
        id: 10000,
        title: "RESTful 101",
        body: "...",
        comments: [ ... ]
      }, ... ]
    }
    end note

== Request 3 for get Follower ==
Client->Server: request to <font color=red><b>/users/{id}/followers</b></font> with <b>HTTP <font color=blue>GET</font></b>
    note right of Client 
      id: "restUserId"
    end note

Server->Client: response with
    note left of Server 
    {
      followers: [ {
        id: "graphqlUserId",
        name: "Karl Park",
        nickname: "xx"
      }, ... ]
    }
    end note
```

우리가 흔히 생각 할 수 있는 모습이다. 하지만, GraphQL로 위의 요구사항을 구현하면 어떻게 될까?

### GraphQL
GraphQL은 **Type System** 및 **Schema** 가 있다 !

```uml
Client->Server: request to <font color=red><b>/users/{id}/followers</b></font> with <b>HTTP <font color=blue>POST</font></b>
    note right of Client 
        query {
          User(id: "graphqlUserId") {
            name
            posts {
              title
            }
            followers(first: 3) {
              id
              name
            }
          }
        }
    end note

Server->Client: response with
    note left of Server 
    {
      "data": {
        "User": {
          "name": "Karl Park",
          "posts": [ {
            "title" : "GraphQL 101",
          }, ... ],
          "followers": [ {
            { "id": "greatGraphQL", "name": "byFacebook" },
            { "id": "moreEfficient", "name": "doItNow" },
            { "id": "singleEndPoint", "name": "soEasyToUse" }
          } ]
        }
      }
    }
    end note
```

> 참 쉽지 아니한가!


## GraphQL의 핵심

### SDL (The Schema Definition Language)
GraphQL은 Type System을 따른다.
위의 예시에서는 User와, Post, Follower를 사용하였는데 아래와 같이 정의 할 수 있다.

String, Int 등의 Primitive 타입으로 필드 타입을 정의하면서 **`!`** 를 이용하여 **해당 필드는 필수**임을 나타 낼 수 있다.
```graphql
// User Type1
type User {
    name: String!
    nickname: String
}

// User Type2 which has both of posts and followers fields
type User {
    name: String!
    nickname: String
    posts: [Post!]!
    followers: [User!]!
}

type Post {
    title: String!
    comments: [Comment!]!
}
```


아래의 예시를 한개 씩 살펴보며, 의미를 이해해보자.

```
// Query to get all users, and posts which is written by each of users with "query"
{
  allUsers {
    name
    posts {
        title
    }
  }
}

// Create a new user with "mutation" - creating, updatting, deleting
mutation {
  createUser(name: "Newbie", nickname: "abc") {
      name
      bdnicknameay
  }
}

// Subscribe a specific events with "subscribe" - like websocket push
subscription {
  newUser {
    name
    nickname
  }
}

type Query {
  allUsers(last: Int): [User!]!
}

type Mutation {
  createUser(name: String!, nickname: String!): User!
}

type Subscription {
  newUser: User!
}
```



## Codelab

자, 이제 GraphQL을 다 배웠다. (~~응?~~) 써먹어보자 !


Java 등 환경에서 서버/클라를 구축할수도 있지만, 빠른 개발(?)을 위해 nodejs/express 로 서버를 띄우고 클라이언트를 구성해보자.


### 1. nodejs server
```shell
$ npm init
$ npm install graphql express express-graphql -save
```

위와 같이 프로젝트를 설정하고나서, index.js 파일에 다음과 같은 서버 코드 및 GraphQL 코드를 작성한다.

```shell
$ vi index.js

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
```

그리고 나서, 다음과 같이 서버를 실행한다.
```shell
$ node index.js
```

위와 같이 실행한 후, postman 이나 curl 등으로 request를 날려보자 !

```shell
$ curl -X POST \
       -H "Content-Type: application/json" \
       -d '{ "query": "{allUsers(last: 5) {name} user(id: 2) {name}}" }'
```

위와 같이 실행하면, 아래와 같은 응답을 받을 수 있다.

```json
{
  "data": {
    "allUsers": [
      {
        "name": "user1"
      },
      {
        "name": "user2"
      },
      {
        "name": "user3"
      }
    ],
    "user": {
      "name": "user2"
    }
  }
}
```



## Reference
https://www.howtographql.com/basics/1-graphql-is-the-better-rest/