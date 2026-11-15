import { Suspense } from "react";
import { HomeView } from "@/components/home-view";
import { Skeleton } from "@/components/skeleton";
import { getApplications, getCourses, getItems, getOpportunities } from "@/lib/data";

async function Home() {
  const [items, courses, opps, apps] = await Promise.all([getItems(), getCourses(), getOpportunities(), getApplications()]);
  return <HomeView items={items} courses={courses} opps={opps} apps={apps} now={new Date()} />;
}

export default function Page() {
  return <Suspense fallback={<Skeleton />}><Home /></Suspense>;
}
