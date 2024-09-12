document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("createBtn");
  const datasetNameInput = document.getElementById("datasetName");
  const statusMessage = document.getElementById("statusMessage");
  const loadKnowledgeBtn = document.getElementById("loadKnowledgeBtn");
  const loadKnowledgeOption = document.getElementById("loadKnowledgeOption");
  const knowledgeContainer = document.getElementById("knowledgeContainer");
  const datasetSelect = document.getElementById("datasetSelect");
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadStatus = document.getElementById("uploadStatus");

  const deleteBtnLast = document.getElementById("deleteBtnLast");
  const datasetIdInput = document.getElementById("datasetIdInput");
  const documentIdInput = document.getElementById("documentIdInput");
  const deleteStatusLast = document.getElementById("deleteStatusLast");



// API details
const apiUrl = "http://13.212.220.128/v1/datasets";
const apiKey = "dataset-03Z9UFsnQMyzR9Z6ToG4RgMK"; // Replace this with your actual API key

// Create Empty Knowledge //
createBtn.addEventListener("click", () => {
  const datasetName = datasetNameInput.value.trim();

  if (!datasetName) {
    statusMessage.textContent = "Please enter a dataset name.";
    return; // Stop execution if dataset name is empty
  }

  // Create the JSON data payload
  const jsonData = {
    name: datasetName,
  };

  // Send the POST request to create the dataset
  fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json", // Sending JSON
    },
    body: JSON.stringify(jsonData), // Convert the JSON object to a string for sending
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to create dataset");
      }
    })
    .then((data) => {
      statusMessage.textContent = "Knowledge entry created successfully!";
      //console.log('Response Data:', data); // Log response for debugging
    })
    .catch((error) => {
      console.error("Error creating knowledge entry:", error);
      statusMessage.textContent = "Failed to create knowledge entry. Please try again.";
    });
});


//  Load and List Knowledge Entries //
loadKnowledgeBtn.addEventListener("click", () => {
  fetch(`${apiUrl}?page=1&limit=20`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log('API Response:', data); // Log the entire response

      if (data && data.data && data.data.length > 0) {
        displayKnowledgeList(data.data);
      } else {
        knowledgeContainer.textContent = "No knowledge entries found.";
      }
    })
    .catch((error) => {
      console.error("Error loading knowledge entries:", error);
      knowledgeContainer.textContent = "Failed to load knowledge entries.";
    });
});

// Function to display the list of knowledge entries
function displayKnowledgeList(knowledgeEntries) {
  knowledgeContainer.innerHTML = ""; // Clear previous entries

  if (knowledgeEntries.length === 0) {
    knowledgeContainer.textContent = "No knowledge entries available.";
    return;
  }

  knowledgeEntries.forEach((entry) => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("knowledge-entry");

    entryDiv.innerHTML = `
        <h3>${entry.name}</h3>
        <p><strong>Description:</strong> ${entry.description || "No description available"}</p>
        <p><strong>Documents:</strong> ${entry.document_count}</p>
        <p><strong>Words:</strong> ${entry.word_count}</p>
        <p><strong>Created At:</strong> ${new Date(entry.created_at).toLocaleString()}</p>
        <p><strong>Updated At:</strong> ${new Date(entry.updated_at).toLocaleString()}</p>
      `;

    knowledgeContainer.appendChild(entryDiv);
  });
}




// Upload Document to Knowledge Entry //

// Function to populate the knowledge entry dropdown
function populateDatasetSelect(knowledgeEntries) {
  datasetSelect.innerHTML = '<option value="">Select Knowledge Entry</option>'; // Reset options

  knowledgeEntries.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id; // Use the dataset ID
    option.textContent = entry.name; // Use the dataset name for display
    datasetSelect.appendChild(option);
  });
}

// Load knowledge entries and populate dropdown
loadKnowledgeOption.addEventListener("click", () => {
  fetch(`${apiUrl}?page=1&limit=20`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log("API Response:", data); // Log the entire response

      if (data && data.data && data.data.length > 0) {
        populateDatasetSelect(data.data);
      } else {
        if (uploadStatus) uploadStatus.textContent = "No knowledge entries found.";
      }
    })
    .catch((error) => {
      console.error("Error loading knowledge entries:", error);
      if (uploadStatus) uploadStatus.textContent = "Failed to load knowledge entries.";
    });
});

// Upload document to selected knowledge entry
uploadBtn.addEventListener("click", () => {
  const selectedDatasetId = datasetSelect.value;
  const file = fileInput.files[0];

  if (!selectedDatasetId) {
    if (uploadStatus) uploadStatus.textContent = "Please select a knowledge entry.";
    return;
  }

  if (!file) {
    if (uploadStatus) uploadStatus.textContent = "Please select a file to upload.";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("indexing_technique", "High");
  formData.append("process_rule", "Default");

  fetch(`${apiUrl}/${selectedDatasetId}/document/create_by_file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      // Do not set Content-Type for FormData; it will be set automatically
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`HTTP error ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      if (uploadStatus) uploadStatus.textContent = "File uploaded successfully!";
      console.log("Upload Response:", data);
    })
    .catch((error) => {
      console.error("Error uploading document:", error);
      if (uploadStatus) uploadStatus.textContent = "Failed to upload file. Please try again.";
    });
});


//  ***

// Function to populate the knowledge entry dropdown for deletion
function populateDatasetSelectForDelete(knowledgeEntries) {
    const datasetSelectForDeleteLast = document.getElementById("datasetSelectForDeleteLast");
    datasetSelectForDeleteLast.innerHTML = '<option value="">Select Knowledge Entry</option>'; // Reset options
  
    knowledgeEntries.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.id; // Use the dataset ID
      option.textContent = entry.name; // Use the dataset name for display
      datasetSelectForDeleteLast.appendChild(option);
    });
  }
  
  // Function to populate the document dropdown based on selected knowledge entry
// Function to populate the document dropdown based on selected knowledge entry
function populateDocumentSelect(documents) {
    const documentSelectForDeleteLast = document.getElementById("documentSelectForDeleteLast");
    documentSelectForDeleteLast.innerHTML = '<option value="">Select Document ID</option>'; // Reset options
  
    documents.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id; // Use the document ID
      option.textContent = doc.name || 'No Title'; // Use the document title, fallback to 'No Title' if missing
      documentSelectForDeleteLast.appendChild(option);
    });
  }
  
  
  // Load knowledge entries and populate dropdown
  document.getElementById("loadKnowledgeForDeleteLast").addEventListener("click", () => {
    fetch(`${apiUrl}?page=1&limit=20`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data && data.data.length > 0) {
          populateDatasetSelectForDelete(data.data);
        } else {
          document.getElementById("deleteStatus").textContent = "No knowledge entries found.";
        }
      })
      .catch((error) => {
        console.error("Error loading knowledge entries:", error);
        document.getElementById("deleteStatus").textContent = "Failed to load knowledge entries.";
      });
  });
  
  // Load documents for the selected knowledge entry
  document.getElementById("datasetSelectForDeleteLast").addEventListener("change", (event) => {
    const selectedDatasetId = event.target.value;
    
    if (selectedDatasetId) {
      fetch(`${apiUrl}/${selectedDatasetId}/documents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.data && data.data.length > 0) {
            populateDocumentSelect(data.data);
          } else {
            document.getElementById("deleteStatus").textContent = "No documents found.";
          }
        })
        .catch((error) => {
          console.error("Error loading documents:", error);
          document.getElementById("deleteStatus").textContent = "Failed to load documents.";
        });
    }
  });
  
  // Delete document from selected knowledge entry
  document.getElementById("deleteBtnLast").addEventListener("click", () => {
    const selectedDatasetId = document.getElementById("datasetSelectForDeleteLast").value;
    const selectedDocumentId = document.getElementById("documentSelectForDeleteLast").value;
  
    if (!selectedDatasetId) {
      document.getElementById("deleteStatus").textContent = "Please select a knowledge entry.";
      return;
    }
  
    if (!selectedDocumentId) {
      document.getElementById("deleteStatus").textContent = "Please select a document ID to delete.";
      return;
    }
  
    fetch(`${apiUrl}/${selectedDatasetId}/documents/${selectedDocumentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`HTTP error ${response.status}: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("deleteStatusLast").textContent = "Document deleted successfully!";
        console.log("Delete Response:", data);
      })
      .catch((error) => {
        console.error("Error deleting document:", error);
        document.getElementById("deleteStatusLast").textContent = "Failed to delete document. Please try again.";
      });
  });
});
