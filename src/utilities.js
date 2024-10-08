const fingerJoints = {
    thumb:[0,1,2,3,4],
    indexFinger:[0,5,6,7,8],
    middleFinger:[0,9,10,11,12],
    ringFinger:[0,13,14,15,16],
    pinky:[0,17,18,19,20],
};


export const drawHand = (predictions, ctx, lineColor = "white", lineWidth = 7, dotColor = "blue", dotSize = 9) => {
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            const landmarks = prediction.landmarks;

            // Loop through each finger and draw the lines connecting the joints
            for (let j = 0; j < Object.keys(fingerJoints).length; j++) {
                let finger = Object.keys(fingerJoints)[j];
                
                for (let k = 0; k < fingerJoints[finger].length - 1; k++) {
                    const firstJointIndex = fingerJoints[finger][k];
                    const secondJointIndex = fingerJoints[finger][k + 1];

                    // Draw the lines between joints
                    ctx.beginPath();
                    ctx.moveTo(
                        landmarks[firstJointIndex][0],
                        landmarks[firstJointIndex][1]
                    );
                    ctx.lineTo(
                        landmarks[secondJointIndex][0],
                        landmarks[secondJointIndex][1]
                    );
                    ctx.strokeStyle = lineColor; // Set line color
                    ctx.lineWidth = lineWidth;   // Set line thickness
                    ctx.stroke();
                }
            }

            // Draw the key points (dots) on the hand
            for (let i = 0; i < landmarks.length; i++) {
                const x = landmarks[i][0];
                const y = landmarks[i][1];

                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, 2 * Math.PI); // Use dynamic dot size
                ctx.fillStyle = dotColor;               // Set dot color
                ctx.fill();
            }
        });
    }
};
