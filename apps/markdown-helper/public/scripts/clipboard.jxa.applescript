function run(){
  const app = Application.currentApplication();
  app.includeStandardAdditions = true
  const clip = app.theClipboard({ as: "file" });
  return clip.toString();
}
