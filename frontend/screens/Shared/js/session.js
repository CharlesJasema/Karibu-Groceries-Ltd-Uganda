export const getSession = () =>
  JSON.parse(localStorage.getItem("kgl_current_user"));

export const setSession = (data) =>
  localStorage.setItem("kgl_current_user", JSON.stringify(data));
