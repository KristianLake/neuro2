const handleAccessSubmit = async () => {
  try {
    const result = await validateAccessCode(code);
    if (result.success) {
      // Add page refresh after successful validation
      window.location.reload();
    }
  } catch (error: unknown) { // Add proper typing
    // Existing error handling
  }
};
