-- Make sure to provide a BCrypt hashed password here.
-- In this example, the hash corresponds to the password "password"

INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$12$ki/kpq5xA63WAvbYMggf/uOu5R8M7nEXeDutF1Zfp.o9rc7r9FjrC', 'ROLE_ADMIN');

INSERT INTO product(name, description, price)
VALUES ('Product 1', 'Product1 description', '10.99'),
       ('Product 2', 'Product2 description', '11.22'),
       ('Product 3', 'Product3 description', '22.33');
