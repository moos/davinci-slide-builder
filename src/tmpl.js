let main = (d) => 
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
    <resources>
${d.resources}
    </resources>
    <library>
        <event name="slideshow #1">
            <project name="${d.projName}">
                <sequence>
                    <spine>
${d.spine}
                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>
`;

module.exports = {
  main
};
