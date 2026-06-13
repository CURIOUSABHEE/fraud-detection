from fastapi import Security
from app.db.neo4j import neo4j_conn

def index():
    return {"msg": "server is running"}

def test_neo4j_connection():
    query_test = """
    RETURN 'Neo4j connection is working' as message
    """
    
    results = neo4j_conn.query(query_test)
    data = []
    for record in results:
        data.append({
            "message": record["message"]
        })
    
    return {
        "status": "Neo4j connection is working ✅",
        "data": data
    }