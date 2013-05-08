uitools
========================================================================================

UI tools for Photoshop and Flash

Here's a quick tutorial on how to use save_layers_to_files.jsx and assemble_ui.jsfl:

Step 1
----------------------------------------------------------------------------------------
Label the layers you want to export and hide the layers you don't need. Run _save_layers_to_files.jsx_ by going to File->Scripts->Browse... in Photoshop. It will take a few minutes to run through everything.  Groups will be merged into single layers unless the option is changed in the script.

Note: be careful if you have layers that run off the canvas because the script duplicates entire layers before exporting, which could result in problems.  You can typically fix this by cropping the canvas at maximum size beforehand.  This issue will be fixed in a later update.



Step 2
----------------------------------------------------------------------------------------
You can look through the images that Photoshop generated in step 1 and check to see if they were made correctly.  You might also want to check the .csv files to make sure they look right.  <filename>_text_styles.txt contains text style information that might be useful for the engineers.  



Step 3
----------------------------------------------------------------------------------------
Create a new .fla file in Flash with the same name as your .psd file from step 1.  Save this file in the same folder as the .psd.



Step 4
----------------------------------------------------------------------------------------
Within Flash, set your stage size to 800x480 or 480x800 (or to whatever resolution the game is using).  Next, run assemble_ui.jsfl by going to Commands->Run Command... and selecting that script.  The images will be imported from the /<filename>_png/ folder and placed on the stage according to the variables from the .csv file.  The text .csv file will be used to create dynamic text fields with the same attributes as the text layers in the Photoshop document.  It isn't perfect but it's a close approximation.  Layer effects applied to text layers are ignored. 