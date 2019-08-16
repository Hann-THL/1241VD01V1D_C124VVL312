CREATE TABLE IF NOT EXISTS result_4d (
	-- base columns
	id SERIAL,
	status_code record_status NOT NULL DEFAULT 'A',
	created_by VARCHAR(50) NOT NULL,
	created_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by VARCHAR(50) NOT NULL,
	updated_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	-- table columns
	uuid VARCHAR(15) PRIMARY KEY,
	company_code VARCHAR(5) NOT NULL,
	draw_date DATE NOT NULL,
	draw_no VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS result_4d_number (
	-- base columns
	id SERIAL,
	status_code record_status NOT NULL DEFAULT 'A',
	created_by VARCHAR(50) NOT NULL,
	created_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_by VARCHAR(50) NOT NULL,
	updated_dt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	
	-- table columns
	id_result VARCHAR(15) NOT NULL,
	number VARCHAR(4) NOT NULL,
	category VARCHAR(5) NOT NULL,
	position SMALLINT NOT NULL
);