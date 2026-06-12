import type { AnalyticsData } from "@/types"

export const analytics: AnalyticsData = {
  revenue: [
    { month: "Jul 2025", amount: 2450000 },
    { month: "Aug 2025", amount: 2580000 },
    { month: "Sep 2025", amount: 2420000 },
    { month: "Oct 2025", amount: 2680000 },
    { month: "Nov 2025", amount: 2850000 },
    { month: "Dec 2025", amount: 3100000 },
    { month: "Jan 2026", amount: 2950000 },
    { month: "Feb 2026", amount: 2800000 },
    { month: "Mar 2026", amount: 3250000 },
    { month: "Apr 2026", amount: 3420000 },
    { month: "May 2026", amount: 3680000 },
    { month: "Jun 2026", amount: 3100000 },
  ],
  patients: [
    { month: "Jul 2025", count: 1850 },
    { month: "Aug 2025", count: 1920 },
    { month: "Sep 2025", count: 1780 },
    { month: "Oct 2025", count: 2100 },
    { month: "Nov 2025", count: 2250 },
    { month: "Dec 2025", count: 2480 },
    { month: "Jan 2026", count: 2350 },
    { month: "Feb 2026", count: 2180 },
    { month: "Mar 2026", count: 2650 },
    { month: "Apr 2026", count: 2780 },
    { month: "May 2026", count: 2950 },
    { month: "Jun 2026", count: 2480 },
  ],
  tests: [
    { month: "Jul 2025", count: 4200 },
    { month: "Aug 2025", count: 4450 },
    { month: "Sep 2025", count: 4100 },
    { month: "Oct 2025", count: 4800 },
    { month: "Nov 2025", count: 5100 },
    { month: "Dec 2025", count: 5600 },
    { month: "Jan 2026", count: 5300 },
    { month: "Feb 2026", count: 5000 },
    { month: "Mar 2026", count: 5900 },
    { month: "Apr 2026", count: 6200 },
    { month: "May 2026", count: 6500 },
    { month: "Jun 2026", count: 5400 },
  ],
  turnaround: [
    { department: "Biochemistry", avgHours: 4.5 },
    { department: "Hematology", avgHours: 3.2 },
    { department: "Microbiology", avgHours: 28.0 },
    { department: "Immunology", avgHours: 6.8 },
    { department: "Histopathology", avgHours: 52.0 },
    { department: "Molecular Biology", avgHours: 18.5 },
    { department: "Clinical Pathology", avgHours: 3.5 },
    { department: "Endocrinology", avgHours: 5.5 },
  ],
  branchPerformance: [
    { branch: "Mumbai HQ", revenue: 1680000, tests: 4200 },
    { branch: "Delhi", revenue: 1520000, tests: 3800 },
    { branch: "Bangalore", revenue: 1400000, tests: 3500 },
    { branch: "Hyderabad", revenue: 1240000, tests: 3100 },
    { branch: "Chennai", revenue: 1120000, tests: 2800 },
    { branch: "Pune", revenue: 960000, tests: 2400 },
  ],
  doctorReferrals: [
    { doctor: "Dr. Sneha Reddy", count: 342, revenue: 854000 },
    { doctor: "Dr. Kartik Saxena", count: 287, revenue: 1250000 },
    { doctor: "Dr. Ananya Gupta", count: 298, revenue: 920000 },
    { doctor: "Dr. Neha Kapoor", count: 198, revenue: 678000 },
    { doctor: "Dr. Lata Menon", count: 223, revenue: 756000 },
    { doctor: "Dr. Priya Sharma", count: 175, revenue: 634000 },
    { doctor: "Dr. Vikram Patel", count: 134, revenue: 567000 },
    { doctor: "Dr. Rohan Deshmukh", count: 167, revenue: 612000 },
  ],
}

export const getRevenueTrend = () => analytics.revenue
export const getPatientTrend = () => analytics.patients
export const getTestTrend = () => analytics.tests
export const getTurnaroundTimes = () => analytics.turnaround
export const getBranchPerformance = () => analytics.branchPerformance
export const getDoctorReferrals = () => analytics.doctorReferrals
