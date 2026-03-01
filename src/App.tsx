import { Home, BookOpenCheckIcon, GraduationCap } from "lucide-react";
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { Layout } from "@/components/refine-ui/layout/layout.tsx";
import Dashboard from "@/pages/dashboard.tsx";
import SubjectList from "@/pages/subjects/list.tsx";
import SubjectCreate from "@/pages/subjects/create.tsx";
import {dataProvider} from "@/providers/data.ts";
import ClassesList from "@/pages/classes/list.tsx";
import ClassesCreate from "@/pages/classes/create.tsx";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                title: {
                  text: "Logic Zone",
                },
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list: "/subjects",
                  create: "/subjects/create",
                  meta: { label: "Subjects", icon: <BookOpenCheckIcon /> },
                },
                {
                  name: "classes",
                  list: "/classes",
                  create: "/classes/create",
                  meta: { label: "Classes", icon: <GraduationCap /> },
                },
              ]}
            >
              <Routes>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="subjects">
                    <Route index element={<SubjectList />}></Route>
                    <Route path="create" element={<SubjectCreate />}></Route>
                  </Route>
                  <Route path="classes">
                    <Route index element={<ClassesList />}></Route>
                    <Route path="create" element={<ClassesCreate />}></Route>
                  </Route>
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
