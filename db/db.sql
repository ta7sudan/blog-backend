CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name varchar(30) UNIQUE NOT NULL,
	password varchar(30) NOT NULL,
	profile text,
	backup0 integer,
	backup1 integer,
	backup2 integer,
	backup3 varchar(50),
	backup4 varchar(50),
	backup5 varchar(50),
	backup6 boolean,
	backup7 boolean,
	backup8 boolean,
	backup9 timestamp without time zone,
	backup10 timestamp without time zone
);

CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	pid varchar(40) UNIQUE NOT NULL, -- uuid, postgre鼓励不用char()
	uid integer REFERENCES users(id) NOT NULL,
	title varchar(80) NOT NULL,
	author varchar(30) NOT NULL,
	tags varchar(30)[], -- 备用
	views integer DEFAULT 0,
	img text,
	parsed boolean DEFAULT FALSE,
	created_time timestamp without time zone DEFAULT NOW(),
	modified_time timestamp without time zone,
	content text,
	backup0 integer,
	backup1 integer,
	backup2 integer,
	backup3 varchar(50),
	backup4 varchar(50),
	backup5 varchar(50),
	backup6 boolean,
	backup7 boolean,
	backup8 boolean,
	backup9 timestamp without time zone,
	backup10 timestamp without time zone
);

CREATE TABLE tags (
	id SERIAL PRIMARY KEY,
	pid integer REFERENCES posts(id) NOT NULL,
	tag_name varchar(30) NOT NULL,
	backup0 integer,
	backup1 integer,
	backup2 integer,
	backup3 varchar(50),
	backup4 varchar(50),
	backup5 varchar(50),
	backup6 boolean,
	backup7 boolean,
	backup8 boolean,
	backup9 timestamp without time zone,
	backup10 timestamp without time zone
);

CREATE TABLE friends (
	id SERIAL PRIMARY KEY,
	avatar text,
	name varchar(30) NOT NULL,
	"desc" varchar(100), -- desc保留字加""", 见http://www.postgres.cn/docs/10/sql-syntax-lexical.html , 保留字见 https://www.postgresql.org/docs/10/sql-keywords-appendix.html
	link text NOT NULL,
	backup0 integer,
	backup1 integer,
	backup2 integer,
	backup3 varchar(50),
	backup4 varchar(50),
	backup5 varchar(50),
	backup6 boolean,
	backup7 boolean,
	backup8 boolean,
	backup9 timestamp without time zone,
	backup10 timestamp without time zone
);


CREATE TABLE comments (
	id SERIAL PRIMARY KEY,
	pid integer REFERENCES posts(id) NOT NULL,
	visitor_name varchar(30) NOT NULL,
	visitor_email varchar(50),
	content varchar(1000) NOT NULL,
	reply_id integer,
	backup0 integer,
	backup1 integer,
	backup2 integer,
	backup3 varchar(50),
	backup4 varchar(50),
	backup5 varchar(50),
	backup6 boolean,
	backup7 boolean,
	backup8 boolean,
	backup9 timestamp without time zone,
	backup10 timestamp without time zone
);

CREATE INDEX  posts_id_index ON posts(id);

CREATE INDEX  posts_pid_index ON posts(pid);

CREATE INDEX  tags_pid_index ON tags(pid);

CREATE INDEX  comments_pid_index ON comments(pid);