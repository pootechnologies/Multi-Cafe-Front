// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ user, requiredRoles = [], children }) => {
//   // // If user is not authenticated, redirect to login
//   // if (!user) {
//   //   console.warn("User is not authenticated. Redirecting to login.");
//   //   return <Navigate to="/login" />;
//   // }

//   // If roles are specified, check if the user's role is in the allowed roles
//   if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
//     console.warn(
//       `Access denied. User role: ${user?.role}. Required roles: ${requiredRoles.join(", ")}`
//     );
//     return <Navigate to="/" />; // Redirect to a safe default page like the dashboard
//   }

//   // Render the child components if all checks pass
//   return children;
// };

// export default ProtectedRoute;
