# CXFabric AI Chat Interface

### Installation

1. **Install dependencies:**
  ```bash
  npm install
  ```

2. **Create a `.env` file** in the root folder.

---

### Configuration

#### For CXFabric Flow

Add the following environment variables to your `.env` file:

```env
REACT_APP_TENANT_ID=your_tenant_id
REACT_APP_FLOW_ID=your_flow_id
REACT_APP_BEARER_TOKEN=your_bearer_token
```

---

#### Calling OpenAI API Directly

Add your OpenAI API key to the `.env` file:

```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

---

#### Using Ollama

1. **Install Ollama:**  
  Download and install from [Ollama's website](https://ollama.com/download).

2. **Finding an Ollama Model**
  Find a model you like from [Ollama's website](https:ollama.com/models).

3. **Pull a model (e.g., LLaMA 3):**
  ```bash
  ollama pull llama3
  ```

4. **Start the Ollama server (if not already running):**
  ```bash
  ollama serve
  ```

5. **Update your `.env` file:**
  ```env
  REACT_APP_API_BASE_URL=http://localhost:11434
  ```

---

### Start the Application

Run the following command to start the application:

```bash
npm start
```
