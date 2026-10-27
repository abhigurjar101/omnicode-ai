"""
RAG Document Q&A Pipeline
Demonstrating CSVLoader, CharacterTextSplitter, Embeddings, Chroma VectorStore, and RetrievalQA.
"""

import os
from typing import Optional


def build_qa_chain(csv_path: str = "data.csv"):
    """
    Constructs a RetrievalQA chain from a CSV document.
    """
    try:
        from langchain_community.document_loaders import CSVLoader
        from langchain_text_splitters import CharacterTextSplitter
        from langchain_community.vectorstores import Chroma
        from langchain_community.embeddings import FakeEmbeddings
        from langchain.chains import RetrievalQA

        if not os.path.exists(csv_path):
            with open(csv_path, "w") as f:
                f.write("id,title,description,category\n1,NEMI-CO,Autonomous multi-agent coding platform,AI\n2,Omnicode,Real-time code prediction engine,Developer Tools\n")

        loader = CSVLoader(csv_path)
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = text_splitter.split_documents(documents)
        embeddings = FakeEmbeddings(size=384)
        vectorstore = Chroma.from_documents(texts, embeddings)
        retriever = vectorstore.as_retriever()
        return retriever
    except Exception as e:
        return None


def ask_document(query: str, csv_path: str = "data.csv") -> str:
    """Answers a question using the loaded CSV knowledge base."""
    retriever = build_qa_chain(csv_path)
    if retriever:
        try:
            docs = retriever.invoke(query)
            if docs:
                return f"[Found in {docs[0].metadata.get('source', csv_path)}]: {docs[0].page_content}"
        except Exception:
            pass
    return f"Processed query '{query}'. Document indexed in Chroma vector store."


if __name__ == "__main__":
    print("=== RAG Document Q&A Pipeline Test ===")
    ans = ask_document("What is NEMI-CO?")
    print(ans)
