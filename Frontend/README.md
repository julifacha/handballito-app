# Handballito Time - Frontend

A React application built with Vite that connects to a .NET backend.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running .NET backend server

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your backend URL:
   - Create a `.env` file in the root directory
   - Add: `VITE_API_BASE_URL=http://localhost:5000/api`
   - Replace with your actual .NET backend URL and port

### Running the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  ├── api/
  │   ├── apiClient.js    # Axios instance with interceptors
  │   └── apiService.js   # API service functions
  ├── App.jsx             # Main application component
  ├── App.css             # Application styles
  ├── main.jsx            # Application entry point
  └── index.css           # Global styles
```

## Connecting to .NET Backend

### 1. Update API Endpoints

Edit `src/api/apiService.js` and replace the example endpoints with your actual .NET backend endpoints:

```javascript
export const apiService = {
  async getData() {
    const response = await apiClient.get('/your-endpoint');
    return response.data;
  },
  // Add more endpoints as needed
};
```

### 2. Configure CORS in .NET Backend

Make sure your .NET backend allows CORS requests from the frontend:

```csharp
// In your Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowReactApp");
```

### 3. Environment Variables

The app uses environment variables for configuration:
- `VITE_API_BASE_URL`: Base URL for your .NET backend API

## Features

- ✅ Axios-based HTTP client with interceptors
- ✅ Error handling and response interceptors
- ✅ Connection status checking
- ✅ Environment-based configuration
- ✅ Proxy configuration for development
- ✅ Modern React with hooks

## Development

- The Vite dev server includes a proxy configuration for `/api` routes
- Hot module replacement (HMR) is enabled
- ESLint is configured for code quality

## License

MIT

