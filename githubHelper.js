const { exec } = require('child_process');

function uploadToGithub(repoUrl, commitMessage = "Actualización automática por Alfa") {
  return new Promise((resolve, reject) => {
    const command = `git add . && git commit -m "${commitMessage}" && git push origin main`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error en git: ${error.message}`);
        return reject(error.message);
      }
      resolve(stdout || stderr);
    });
  });
}
