-- The number of connections at each node, counting a connection from a node to itself twice.
-- Path searches rank neighbours by it, and counting connections for each request read too many rows.
ALTER TABLE nodes ADD COLUMN connection_count INTEGER NOT NULL DEFAULT 0;

UPDATE nodes SET connection_count =
  (SELECT COUNT(*) FROM connections WHERE source_node_id = nodes.id)
  + (SELECT COUNT(*) FROM connections WHERE target_node_id = nodes.id);

CREATE TRIGGER connections_count_inserted AFTER INSERT ON connections BEGIN
  UPDATE nodes SET connection_count = connection_count + 1 WHERE id = NEW.source_node_id;
  UPDATE nodes SET connection_count = connection_count + 1 WHERE id = NEW.target_node_id;
END;

CREATE TRIGGER connections_count_deleted AFTER DELETE ON connections BEGIN
  UPDATE nodes SET connection_count = connection_count - 1 WHERE id = OLD.source_node_id;
  UPDATE nodes SET connection_count = connection_count - 1 WHERE id = OLD.target_node_id;
END;

CREATE TRIGGER connections_count_moved AFTER UPDATE OF source_node_id, target_node_id ON connections
BEGIN
  UPDATE nodes SET connection_count = connection_count - 1 WHERE id = OLD.source_node_id;
  UPDATE nodes SET connection_count = connection_count - 1 WHERE id = OLD.target_node_id;
  UPDATE nodes SET connection_count = connection_count + 1 WHERE id = NEW.source_node_id;
  UPDATE nodes SET connection_count = connection_count + 1 WHERE id = NEW.target_node_id;
END;
