class MockDocumentReference:
    def __init__(self, collection_name, doc_id, client):
        self.collection_name = collection_name
        self.id = doc_id
        self.client = client
        
    def delete(self):
        if self.collection_name in self.client.data and self.id in self.client.data[self.collection_name]:
            del self.client.data[self.collection_name][self.id]

class MockDocumentSnapshot:
    def __init__(self, doc_id, data, reference):
        self.id = doc_id
        self._data = data
        self.reference = reference
        self.exists = data is not None
        
    def to_dict(self):
        return dict(self._data) if self._data else None

class MockDocument:
    def __init__(self, collection_name, doc_id, client):
        self.collection_name = collection_name
        self.id = doc_id
        self.client = client
        
    def set(self, data):
        if self.collection_name not in self.client.data:
            self.client.data[self.collection_name] = {}
        self.client.data[self.collection_name][self.id] = dict(data)
        
    def get(self):
        col_data = self.client.data.get(self.collection_name, {})
        data = col_data.get(self.id)
        ref = MockDocumentReference(self.collection_name, self.id, self.client)
        return MockDocumentSnapshot(self.id, data, ref)

class MockQuery:
    def __init__(self, collection_name, client, filters=None):
        self.collection_name = collection_name
        self.client = client
        self.filters = filters or []
        
    def where(self, field, op, val):
        new_filters = list(self.filters)
        new_filters.append((field, op, val))
        return MockQuery(self.collection_name, self.client, new_filters)
        
    def document(self, doc_id):
        return MockDocument(self.collection_name, str(doc_id), self.client)
        
    def stream(self):
        docs = []
        col_data = self.client.data.get(self.collection_name, {})
        for doc_id, data in col_data.items():
            match = True
            for field, op, val in self.filters:
                if op == "==":
                    if data.get(field) != val:
                        match = False
                        break
            if match:
                ref = MockDocumentReference(self.collection_name, doc_id, self.client)
                docs.append(MockDocumentSnapshot(doc_id, data, ref))
        return docs

class MockFirestoreClient:
    def __init__(self):
        self.data = {
            "campaigns": {},
            "campaign_results": {},
            "memories": {}
        }
        
    def collection(self, name):
        return MockQuery(name, self)
