/*
 * BASE ENUM: record_status
 */
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'record_status') THEN
        CREATE TYPE record_status AS ENUM ('A', 'D');
    END IF;
END$$;



/*
 * BASE TABLE: sys_menu table
 */
CREATE TABLE IF NOT EXISTS sys_menu (
	-- base columns
	id SERIAL,
	status_code record_status NOT NULL DEFAULT 'A',
	created_by VARCHAR(50) NOT NULL,
	created_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by VARCHAR(50) NOT NULL,
	updated_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	-- table columns
	code VARCHAR(50) PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	short_title VARCHAR(3),
	icon VARCHAR(30),
	url VARCHAR(100),
	level SMALLINT NOT NULL,
	sequence_no SMALLINT NOT NULL,
	parent_code VARCHAR(50)
);

INSERT INTO sys_menu
	(created_by, updated_by,
	 code, title, short_title, icon, url, level, sequence_no, parent_code)
VALUES
	('SYSTEM', 'SYSTEM', 'M_HOME', 'Home', NULL, 'home', NULL, 1, 1, NULL),
	('SYSTEM', 'SYSTEM', 'M_4D', '4D', '4D', NULL, NULL, 1, 2, NULL),
	('SYSTEM', 'SYSTEM', 'M_4D_PAST_RESULT', 'Past Results', 'PR', NULL, NULL, 2, 1, 'M_4D')
ON CONFLICT (code)
DO NOTHING;