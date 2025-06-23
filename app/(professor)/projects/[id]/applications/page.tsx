'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Loader2, Inbox, SlidersHorizontal, Check, Filter, X } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Document, Page, pdfjs } from 'react-pdf';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface TiptapDisplayProps {
  content: string | null
}

interface ApplicationStudent {
  name: string;
  email: string;
  branch: string;
  cvUrl?: string;
  id: string;
  user: {
    name: string;
    email: string
  }
}

interface ApplicationProject {
  title: string;
}

interface Application {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  coverLetter: string | null;
  student: ApplicationStudent;
  project: ApplicationProject;
}

async function fetchApplications(projectId: string | undefined) {
  if (!projectId) return { applications: [] };

  const res = await fetch(`/api/projects/${projectId}/applications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch applications');
  }
  return res.json();
}

async function updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
  const res = await fetch(`/api/applications/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Failed to update application status');
  }

  return res.json();
}

export default function ApplicationsPage() {
  const params = useParams();
  const projectId = typeof params?.id === 'string' ? params.id : undefined;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: 'ACCEPTED' | 'REJECTED' | null }>({});

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [filterWithCV, setFilterWithCV] = useState<boolean>(false);
  const [filterWithoutCV, setFilterWithoutCV] = useState<boolean>(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentProjects, setSelectedStudentProjects] = useState<any[]>([]);
  const [selectedStudentCV, setSelectedStudentCV] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loadingCV, setLoadingCV] = useState(false);

  const router = useRouter();

  const TiptapDisplay: React.FC<TiptapDisplayProps> = ({ content }) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: '',
        }),
      ],
      content: content || '',
      editable: false,
    })

    return (
      <div className="h-56 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        <EditorContent editor={editor} />
      </div>
    )
  }

  const exportAcceptedApplications = () => {
    const acceptedApps = applications.filter(app => app.status === 'ACCEPTED');

    if (acceptedApps.length === 0) {
      alert('No accepted applications to export');
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Branch'], // Header
      ...acceptedApps.map(app => [
        app.student?.user?.name || '',
        app.student?.user?.email || '',
        app.student.branch || ''
      ])
    ];

    const csvString = csvContent.map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `accepted_applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const getApplications = async () => {
      try {
        const data = await fetchApplications(projectId);
        setApplications(data.applications);
      } catch (error) {
        router.push("/")
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      getApplications();
    } else {
      setLoading(false);
    }
  }, [projectId, router]);

  // Get unique branches for filter
  const branches = useMemo(() => {
    const uniqueBranches = Array.from(new Set(applications.map(app => app.student.branch)));
    return uniqueBranches.sort();
  }, [applications]);

  // Get unique statuses for filter
  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(applications.map(app => app.status)));
    return uniqueStatuses.sort();
  }, [applications]);

  // Filter applications based on selected filters
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (selectedStatus !== 'all' && app.status !== selectedStatus) {
        return false;
      }

      // Branch filter
      if (selectedBranch !== 'all' && app.student.branch !== selectedBranch) {
        return false;
      }

      // CV filters
      const hasCV = Boolean(app.student.cvUrl && app.student.cvUrl.trim() !== '');
      if (filterWithCV && !hasCV) {
        return false;
      }
      if (filterWithoutCV && hasCV) {
        return false;
      }

      return true;
    });
  }, [applications, selectedStatus, selectedBranch, filterWithCV, filterWithoutCV]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";
      case "ACCEPTED":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case "REJECTED":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
      default:
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessing(prev => ({ ...prev, [applicationId]: status }));

    try {
      await updateApplicationStatus(applicationId, status);

      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? { ...app, status } : app))
      );
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessing(prev => {
        const newProcessing = { ...prev };
        delete newProcessing[applicationId];
        return newProcessing;
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedStatus('all');
    setSelectedBranch('all');
    setFilterWithCV(false);
    setFilterWithoutCV(false);
  };

  const hasActiveFilters = selectedStatus !== 'all' || selectedBranch !== 'all' || filterWithCV || filterWithoutCV;

  const handleApplicationClick = async (application: Application) => {
    setSelectedApplication(application); // Set the selected application
    setSelectedStudentId(application.student.id);
    setIsDrawerOpen(true);
    setLoadingProjects(true);
    setPageNumber(1);

    if (application.student.cvUrl) {
      setLoadingCV(true);
    }

    // Set CV URL directly from the application
    setSelectedStudentCV(application.student.cvUrl || null);

    try {
      const response = await fetch(`/api/students/${application.student.id}/projects`);
      if (response.ok) {
        const data = await response.json();
        setSelectedStudentProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching student projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoadingCV(false);
  };

  const onDocumentLoadError = () => {
    setLoadingCV(false);
  };

  if (loading) {
    return (
      <div className={cn("flex w-screen h-screen items-center justify-center bg-white")}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 bg-gradient-to-t from-blue-500 to-blue-600">
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-2xl">Project Applications</CardTitle>
              <CardDescription className="text-xs sm:text-base mt-1">
                {applications[0]?.project?.title || 'Project Details'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    {hasActiveFilters && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Applications</SheetTitle>
                    <SheetDescription>Filter applications by status, branch, and CV availability</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Status</h4>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Branch</h4>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Branches</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">CV Availability</h4>
                      <div className="space-y-2">
                        <Button
                          variant={filterWithCV ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start ${filterWithCV
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            }`}
                          onClick={() => {
                            setFilterWithCV(!filterWithCV);
                            if (filterWithoutCV) setFilterWithoutCV(false);
                          }}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          With CV
                          {filterWithCV && <span className="ml-auto text-xs"><Check className="w-4 h-4 text-blue-100" /></span>}
                        </Button>
                        <Button
                          variant={filterWithoutCV ? "default" : "outline"}
                          size="sm"
                          className={`w-full justify-start ${filterWithoutCV
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            }`}
                          onClick={() => {
                            setFilterWithoutCV(!filterWithoutCV);
                            if (filterWithCV) setFilterWithCV(false);
                          }}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Without CV
                          {filterWithoutCV && <span className="ml-auto text-xs"><Check className="w-4 h-4 text-blue-100" /></span>}
                        </Button>
                      </div>
                      {(filterWithCV || filterWithoutCV) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setFilterWithCV(false);
                            setFilterWithoutCV(false);
                          }}
                        >
                          Clear CV Filter
                        </Button>
                      )}
                    </div>

                    {hasActiveFilters && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={clearAllFilters}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    )}

                    {/* Add this new section */}
                    {selectedStatus === 'ACCEPTED' && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={exportAcceptedApplications}
                        >
                          Export Accepted Applications (CSV)
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                {filteredApplications.length} of {applications.length} Applications
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-6 sm:py-10">
              <Inbox className="h-16 w-16 text-gray-500" />
              <p className="text-gray-600 text-md sm:text-xl">
                {applications.length === 0
                  ? "No one has applied for this project yet."
                  : "No applications match your current filters."
                }
              </p>
              {hasActiveFilters && applications.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleApplicationClick(application)}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{application.student?.user?.name}</h3>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{application.student?.user?.email}</p>
                    <p className="text-sm text-gray-600">{application.student.branch}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="text-sm sm:text-base"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[75vh]">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle>Student Details</DrawerTitle>
            {selectedApplication && (
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </Badge>
                {selectedApplication.status !== 'PENDING' && (
                  <Select
                    value={selectedApplication.status}
                    onValueChange={(value: 'ACCEPTED' | 'REJECTED') => handleStatusUpdate(selectedApplication.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACCEPTED" className="text-green-600">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Accept
                        </div>
                      </SelectItem>
                      <SelectItem value="REJECTED" className="text-red-600">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Reject
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {selectedApplication.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'ACCEPTED')}
                      disabled={processing[selectedApplication.id] === 'ACCEPTED' || processing[selectedApplication.id] === 'REJECTED'}
                    >
                      {processing[selectedApplication.id] === 'ACCEPTED' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'REJECTED')}
                      disabled={processing[selectedApplication.id] === 'ACCEPTED' || processing[selectedApplication.id] === 'REJECTED'}
                    >
                      {processing[selectedApplication.id] === 'REJECTED' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DrawerHeader>

          <div className="flex h-full p-4 gap-4">
            {/* Show single loading state while either projects or CV is loading */}
            {(loadingProjects && loadingCV) ? (
              <div className="flex h-full w-full items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-700"></div>
              </div>
            ) : (
              <>
                {/* Left side - Cover Letter and Projects */}
                <div className="w-1/2 pr-4 flex flex-col">
                  {/* Cover Letter Section */}
                  <div className="cover-letter-section">
                    <h3 className='font-semibold mb-3'>Cover Letter</h3>
                    {selectedApplication?.coverLetter ? (
                      <div className="cover-letter-content">
                        <TiptapDisplay content={selectedApplication.coverLetter} />
                      </div>
                    ) : (
                      <p>No cover letter provided</p>
                    )}
                  </div>

                  {/* Applied Projects Section */}
                  <div className="flex-1">
                    <h3 className="font-semibold my-3">Applied Projects</h3>
                    <div className="space-y-2 overflow-y-scroll max-h-40 pb-8 pr-2">
                      {selectedStudentProjects.map((project) => (
                        <Card key={project.id} className="p-3 flex-shrink-0">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <p className="text-xs text-gray-600">{project.professorName}</p>
                          <p className="text-xs text-gray-500">{project.department}</p>
                        </Card>
                      ))}
                      <p className='text-xs text-red-600 text-center'>End of Application List.</p>
                    </div>
                  </div>
                </div>

                {/* Right side - CV */}
                <div className="w-1/2 pl-4 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Resume</h3>
                    {selectedStudentCV && (
                      <div className="flex items-center gap-2 text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                          disabled={pageNumber <= 1}
                        >
                          Previous
                        </Button>
                        <span>{pageNumber} / {numPages}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                          disabled={pageNumber >= numPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>

                  {selectedStudentCV ? (
                    <div className="h-full overflow-auto">
                      <Document
                        file={selectedStudentCV}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={<div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                      >
                        <Page
                          pageNumber={pageNumber}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          loading={<div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                          width={700}
                          className="mb-12"
                        />
                      </Document>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No CV available
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}