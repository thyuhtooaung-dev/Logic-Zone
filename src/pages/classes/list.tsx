import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Subject, User } from "@/types";
import { ShowButton } from "@/components/refine-ui/buttons/show.tsx";

type ClassListItem = {
  id: number;
  name: string;
  status: "active" | "inactive" | "archived";
  capacity: number;
  bannerUrl?: string | null;
  subject?: Subject | null;
  teacher?: User | null;
};

const ClassesList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");

  const searchFilters = searchQuery
    ? [{ field: "name", operator: "contains" as const, value: searchQuery }]
    : [];
  const subjectFilters =
    selectedSubject === "all"
      ? []
      : [
          {
            field: "subject",
            operator: "eq" as const,
            value: selectedSubject,
          },
        ];
  const teacherFilters =
    selectedTeacher === "all"
      ? []
      : [
          {
            field: "teacher",
            operator: "eq" as const,
            value: selectedTeacher,
          },
        ];

  const classesTable = useTable<ClassListItem>({
    columns: useMemo<ColumnDef<ClassListItem>[]>(
      () => [
        {
          id: "banner",
          accessorKey: "bannerUrl",
          size: 100,
          header: () => <p className={"column-title"}>Banner</p>,
          cell: ({ getValue, row }) => {
            const bannerUrl = getValue<string | null | undefined>();
            const className = row.original.name;

            return bannerUrl ? (
              <img
                src={bannerUrl}
                alt={`${className} banner`}
                className={"h-12 w-16 rounded-md object-cover"}
              />
            ) : (
              <div
                className={
                  "h-12 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                }
              >
                No image
              </div>
            );
          },
        },
        {
          id: "name",
          accessorKey: "name",
          size: 220,
          header: () => <p className={"column-title"}>Class Name</p>,
          cell: ({ getValue }) => (
            <span className={"text-foreground"}>{getValue<string>()}</span>
          ),
        },
        {
          id: "status",
          accessorKey: "status",
          size: 120,
          header: () => <p className={"column-title"}>Status</p>,
          cell: ({ getValue }) => {
            const status = getValue<ClassListItem["status"]>();
            return (
              <Badge variant={status === "active" ? "default" : "secondary"}>
                {status}
              </Badge>
            );
          },
        },
        {
          id: "subject",
          accessorKey: "subject.name",
          size: 180,
          header: () => <p className={"column-title"}>Subject</p>,
          cell: ({ getValue }) => (
            <span className={"text-foreground"}>
              {getValue<string>() || "N/A"}
            </span>
          ),
        },
        {
          id: "teacher",
          accessorKey: "teacher.name",
          size: 180,
          header: () => <p className={"column-title"}>Teacher</p>,
          cell: ({ getValue }) => (
            <span className={"text-foreground"}>
              {getValue<string>() || "N/A"}
            </span>
          ),
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          size: 120,
          header: () => <p className={"column-title"}>Capacity</p>,
          cell: ({ getValue }) => (
            <span className={"text-foreground"}>{getValue<number>()}</span>
          ),
        },
        {
          id: "details",
          size: 140,
          header: () => <p className={"column-title"}>Details</p>,
          cell: ({ row }) => (
            <ShowButton
              resource="classes"
              recordItemId={row.original.id}
              variant={"outline"}
              size={"sm"}
            >
              View
            </ShowButton>
          ),
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 10, mode: "server" },
      filters: {
        permanent: [...searchFilters, ...subjectFilters, ...teacherFilters],
      },
      sorters: {
        initial: [{ field: "id", order: "desc" }],
      },
    },
  });

  const { query: subjectsQuery } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
  });

  const { query: teachersQuery } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: {
      pageSize: 100,
    },
  });

  const subjects = subjectsQuery.data?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];

  return (
    <ListView>
      <Breadcrumb />
      <h1 className={"page-title"}>Classes</h1>
      <div className={"intro-row"}>
        <p>Quick access to essential metrics and managment tools</p>
        <div className={"actions-row"}>
          <div className={"search-field"}>
            <Search className={"search-icon"} />
            <Input
              type={"text"}
              placeholder={"Search by class name..."}
              className={"pl-10 w-full"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={"flex gap-2 w-full sm:w-auto"}>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton resource="classes" />
          </div>
        </div>
      </div>
      <DataTable table={classesTable} />
    </ListView>
  );
};

export default ClassesList;
