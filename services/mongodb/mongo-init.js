db = db.getSiblingDB('admin');
db.auth("root", "example");

db = db.getSiblingDB('RockCRM');
db.createUser({
  user: "root",
  pwd: "example",
  roles: [
    {
      role: "dbOwner",
      db: "RockCRM"
    }
  ]
});

db.users.insertOne({ name: 'admin', login: 'admin', password: 'admin', role: 'manager' });

db = db.getSiblingDB('RockCRMTabakka');
db.createUser({
  user: "root",
  pwd: "example",
  roles: [
    {
      role: "dbOwner",
      db: "RockCRMTabakka"
    }
  ]
});

db.createUser({
  user: "RockCRMOdnorazkiUser",
  pwd: "7264634eedabnsd22nbqn56b1bd0",
  roles: [
    { role: "dbOwner", db: "RockCRMOdnorazki" },
  ]
})

db.createCollection('init');