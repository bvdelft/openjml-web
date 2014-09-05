<?php

// Specify the location of the 'tmp' folder to store temporary java 
// files. This folder should be rwx for the webservice
$TMPDIR = '/home/bart/Projecten/nowplease/openjml/tmp';

// Path to Yices 2 binary
$YICES = '/home/bart/Projecten/nowplease/openjml/yices2/bin/yices';

// Only continue if source is provided
if (empty($_POST['source']))
  die("No source code provided");

// Create a temporary folder
$tempdir = tempnam($TMPDIR,'jmlfolder_');
if (file_exists($tempdir)) { unlink($tempdir); }
mkdir($tempdir);

// Create java file
$name = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $_POST['name']);
$javafile = $tempdir . '/' . $name; //tempnam($tempdir,'javafile') . '.java';
$temph = fopen($javafile, 'w');
fwrite($temph, $_POST['source']);
fclose($temph);

// Do requested action
if ($_POST['mode'] == 'esc')
  runYices($tempdir, $javafile, $name);
else
  runSyntaxCheck($tempdir, $javafile, $name);

// Remove temporary directory
system('rm -rf ' . $tempdir);

////////////////////////////////////////////////////////////////////////////////

function runSyntaxCheck($dir, $javafile, $name) {

    list($stdout, $stderr, $errcode) =
      runAndEcho( 'timeout 10s'
                  . ' java -Xbootclasspath/p:../../lib/openjml.jar' 
                  . ' -jar ../../lib/openjml.jar'
                  . ' -noInternalSpecs -quiet -strictJML' 
                  . ' ' . $javafile
                , $dir);

    echo str_replace($javafile, $name, $stdout);
    echo str_replace($javafile, $name, $stderr);

    if ($errcode != 0) {
      echo "\n";
      if ($errcode == 124)
        echo "Process timed out (time out is set to 10 seconds)";
      else
        echo "Process exited with error code " . $errcode;
    }

}

function runYices($dir, $javafile, $name) {

    global $YICES;
	list($stdout, $stderr, $errcode) =
      runAndEcho( 'timeout 30s'
                  . ' java' 
                  . ' -jar ../../lib/openjml.jar'
                  . ' -esc'
                  . ' -prover yices2'
                  . ' -exec ' . $YICES 
                  . ' ' . $javafile
                , $dir);

    echo str_replace($javafile, $name, $stdout);
    echo str_replace($javafile, $name, $stderr);

    if ($errcode != 0) {
      echo "\n";
      if ($errcode == 124)
        echo "Process timed out (time out is set to 30 seconds)";
      else
        echo "Process exited with error code " . $errcode;
    }
}

function runAndEcho($cmd, $dir) {

    $descriptorspec = array(
       0 => array("pipe", "r"),  // stdin
       1 => array("pipe", "w"),  // stdout
       2 => array("pipe", "w"),  // stderr
    );

    $process = proc_open($cmd, $descriptorspec, $pipes, $dir, null);

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $errcode = proc_close($process);
    
    return array($stdout,$stderr,$errcode);
}


?>
