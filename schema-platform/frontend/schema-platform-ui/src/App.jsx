import React, { useState } from "react";

import ImportDatabasePage from "./pages/ImportDatabasePage";
import CreateDatabasePage from "./pages/CreateDatabasePage";
import ExplorerPage from "./pages/ExplorerPage";

function App() {

  const [currentPage, setCurrentPage] =
      useState("explorer");

  const [database, setDatabase] = useState({
    name: "My Database",
    type: ".sqlite",
  });


  return (

      <div>

        {currentPage === "import" && (

            <ImportDatabasePage
                onCreateDatabase={() =>
                    setCurrentPage("create")
                }

                onDatabaseImported={(db) => {
                  setDatabase(db);
                  setCurrentPage("explorer");
                }}
            />

        )}


        {currentPage === "create" && (

            <CreateDatabasePage

                onBack={() =>
                    setCurrentPage("import")
                }

                onDatabaseCreated={(db) => {

                  setDatabase(db);

                  setCurrentPage("explorer");

                }}

            />

        )}


        {currentPage === "explorer" && (

            <ExplorerPage

                database={database}

                onBack={() =>
                    setCurrentPage("import")
                }

            />

        )}

      </div>

  );

}

export default App;