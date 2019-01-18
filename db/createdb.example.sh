createdb -p 6666 -U username -E UTF8 --lc-collate='English_United States.1252' --lc-ctype='English_United States.1252' blog;
psql -p 6666 -h 127.0.0.1 -U username -d blog -f db.sql