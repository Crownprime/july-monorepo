JsOsaDAS1.001.00bplist00�Vscript_�#!/usr/bin/env osascript -l JavaScript

function run(){
  let a = Application.currentApplication();
  let as = (a.includeStandardAdditions = true , a);
  const clip = as.theClipboard({as: "file"});
  return clip.toString();
}
run();                            �jscr  ��ޭ